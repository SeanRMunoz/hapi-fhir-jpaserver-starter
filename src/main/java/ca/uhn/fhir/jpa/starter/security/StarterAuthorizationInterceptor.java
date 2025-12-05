package ca.uhn.fhir.jpa.starter.security;

import ca.uhn.fhir.interceptor.api.Hook;
import ca.uhn.fhir.interceptor.api.Pointcut;
import ca.uhn.fhir.jpa.starter.AppProperties;
import ca.uhn.fhir.rest.api.server.RequestDetails;
import ca.uhn.fhir.rest.server.interceptor.auth.AuthorizationInterceptor;
import ca.uhn.fhir.rest.server.interceptor.auth.IAuthRule;
import ca.uhn.fhir.rest.server.interceptor.auth.RuleBuilder;
import org.hl7.fhir.instance.model.api.IBaseResource;
import org.springframework.util.CollectionUtils;

import java.util.Collections;
import java.util.List;

/**
 * #AI-GENERATED
 * <p>
 * A simple AuthorizationInterceptor implementation demonstrating a minimal authorization framework.
 * <p>
 * Behavior (default):
 * - Allows unauthenticated access to CapabilityStatement ("metadata")
 * - Requires authentication for all other requests
 * - When authenticated, allows read/search history across all resources (read-only)
 * - Denies write operations by default
 * <p>
 * This class is purposely minimal and can be extended to support role-based rules by
 * inspecting request headers/claims or userData set by {@link ClerkAuthenticationInterceptor}.
 */
public class StarterAuthorizationInterceptor extends AuthorizationInterceptor {

	public static final String ATTR_USER_ID = ClerkAuthenticationInterceptor.USER_ID_ATTRIBUTE;

	private final AppProperties appProperties;
	private final List<String> adminUsers;

	public StarterAuthorizationInterceptor(AppProperties appProperties) {
		this.appProperties = appProperties;
		this.adminUsers = (appProperties != null)
			? appProperties.getSecurity().getAuthorization().getAdmin_users()
			: Collections.emptyList();
	}

	@Override
	public List<IAuthRule> buildRuleList(RequestDetails theRequestDetails) {
		RuleBuilder rules = new RuleBuilder();

		// 1) Always allow the metadata (capability statement)
		rules.allow().metadata().andThen();

		// Identify the current user based on what authentication layer set
		String userId = (String) theRequestDetails.getUserData().get(ATTR_USER_ID);

		// 2) If no authenticated user -> deny all
		if (userId == null || userId.isBlank()) {
			return rules.denyAll("Unauthenticated request").build();
		}

		// If the user is an admin, allow everything
		boolean isAdminUser = !CollectionUtils.isEmpty(adminUsers) && adminUsers.contains(userId);
		if (isAdminUser) {
			return new RuleBuilder().allowAll().build();
		}

		// 3) Example policy for authenticated users: read-only across all resources
		// Adjust these rules to your needs (e.g., restrict to patient compartment, add write for certain roles, etc.)
		rules
			.allow().read().allResources().withAnyId().andThen();

		// 4) Deny everything else (writes)
		return rules.denyAll("Write operations are NOT ALLOWED for account: '" + userId + "'").build();
	}

	@Hook(Pointcut.STORAGE_PREACCESS_RESOURCES)
	public void storagePreaccess(RequestDetails theRequestDetails, java.util.List<IBaseResource> theResources) {
		// Placeholder: You can filter search result resources here depending on user permissions
	}
}
