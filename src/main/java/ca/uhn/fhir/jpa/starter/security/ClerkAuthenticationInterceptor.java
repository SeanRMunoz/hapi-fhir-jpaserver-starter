package ca.uhn.fhir.jpa.starter.security;

import ca.uhn.fhir.interceptor.api.Hook;
import ca.uhn.fhir.interceptor.api.Interceptor;
import ca.uhn.fhir.interceptor.api.Pointcut;
import ca.uhn.fhir.jpa.starter.AppProperties;
import ca.uhn.fhir.rest.api.server.RequestDetails;
import ca.uhn.fhir.rest.server.exceptions.AuthenticationException;
import ca.uhn.fhir.rest.server.servlet.ServletRequestDetails;
import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkException;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.UrlJwkProvider;
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.RSAKeyProvider;
import jakarta.servlet.http.HttpServletRequest;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.List;

/**
 * #AI-GENERATED
 * HAPI FHIR Authentication Interceptor that validates JWTs issued by Clerk.
 * Applies to all /fhir endpoints except /fhir/metadata.
 */
@Interceptor
public class ClerkAuthenticationInterceptor {

	public static final String USER_ID_ATTRIBUTE = "clerk.userId";

	private final AppProperties.Security.Clerk clerkProps;
	private final JWTVerifier verifier;

	public ClerkAuthenticationInterceptor(AppProperties appProperties) {
		this.clerkProps = appProperties.getSecurity().getClerk();
		String issuer = clerkProps.getIssuer();
		if (issuer == null || issuer.isBlank()) {
			throw new IllegalStateException("hapi.fhir.security.clerk.issuer must be configured");
		}

		// Build RSAKeyProvider backed by Clerk JWKS
		JwkProvider jwkProvider;
		try {
			jwkProvider = new UrlJwkProvider(new java.net.URL(issuer + "/.well-known/jwks.json"));
		} catch (java.net.MalformedURLException e) {
			throw new IllegalStateException("Invalid Clerk issuer URL: " + issuer, e);
		}

		RSAKeyProvider rsaKeyProvider = new RSAKeyProvider() {
			@Override
			public RSAPublicKey getPublicKeyById(String keyId) {
				try {
					Jwk jwk = jwkProvider.get(keyId);
					return (RSAPublicKey) jwk.getPublicKey();
				} catch (JwkException e) {
					throw new RuntimeException("Failed to fetch JWK for kid=" + keyId, e);
				}
			}

			@Override
			public RSAPrivateKey getPrivateKey() {
				return null;
			}

			@Override
			public String getPrivateKeyId() {
				return null;
			}
		};

		Algorithm algorithm = Algorithm.RSA256(rsaKeyProvider);
		com.auth0.jwt.JWTVerifier.BaseVerification verification = (com.auth0.jwt.JWTVerifier.BaseVerification) JWT.require(algorithm)
			.withIssuer(issuer)
			.acceptLeeway(60); // allow small clock skew

		List<String> audiences = clerkProps.getAudience();
		if (audiences != null && !audiences.isEmpty()) {
			verification.withAnyOfAudience(audiences.toArray(new String[0]));
		}

		// Enforce the presence of Clerk's default claims
		verification
			.withClaimPresence("exp")
			.withClaimPresence("iat")
			.withClaimPresence("iss")
			.withClaimPresence("nbf")
			.withClaimPresence("sub");
		this.verifier = verification.build();
	}

	@Hook(Pointcut.SERVER_INCOMING_REQUEST_PRE_HANDLED)
	public void incomingRequestPreHandled(RequestDetails theRequestDetails) {
		// Skip authentication for metadata endpoint
		String requestPath = theRequestDetails.getRequestPath(); // e.g., metadata, Patient, Patient/123
		if (requestPath != null) {
			String normalized = requestPath.startsWith("/") ? requestPath : "/" + requestPath;
			if (normalized.equalsIgnoreCase("/metadata")) {
				return; // allow unauthenticated
			}
		}

		String authz = extractAuthorizationHeader(theRequestDetails);
		if (authz == null || !authz.toLowerCase().startsWith("bearer ")) {
			throw unauthorized("Missing or invalid Authorization header");
		}
		String token = authz.substring(7).trim();

		try {
			DecodedJWT jwt = verifier.verify(token);
			String userId = jwt.getSubject();
			if (userId == null || userId.isBlank()) {
				throw unauthorized("Token subject (sub) is missing");
			}
			// expose user id on request for downstream use
			exposeUserId(theRequestDetails, userId);
		} catch (JWTVerificationException e) {
			throw unauthorized("JWT verification failed: " + e.getMessage());
		}
	}

	private String extractAuthorizationHeader(RequestDetails details) {
		if (details instanceof ServletRequestDetails) {
			HttpServletRequest req = ((ServletRequestDetails) details).getServletRequest();
			String header = req.getHeader("Authorization");
			if (header != null) return header;
		}
		String header = details.getHeader("Authorization");
		return header;
	}

	private void exposeUserId(RequestDetails details, String userId) {
		// HAPI provides a userData map for request-scoped storage
		details.getUserData().put(USER_ID_ATTRIBUTE, userId);
		if (details instanceof ServletRequestDetails) {
			HttpServletRequest req = ((ServletRequestDetails) details).getServletRequest();
			req.setAttribute(USER_ID_ATTRIBUTE, userId);
		}
	}

	private AuthenticationException unauthorized(String message) {
		AuthenticationException ex = new AuthenticationException(message);
		ex.addAuthenticateHeaderForRealm("MyRealm");
		return ex;
	}
}
