package com.atl.auth.utility;

public class ApplicationConstant {
    public static final String DEFAULT_ROLE = "STUDENT";
    public static final String TENANT_ADMIN_ROLE = "TENANT_ADMIN";

    public static final String API_FAILED = "FAILED";
    public static final String API_SUCCESS = "SUCCESS";

    public static final String API_LOGIN_SUCCESS_MSG = "User Login Successful";
    public static final String API_SIGNUP_SUCCESS_MSG = "User Registered Successfully";
    public static final String API_OTP_VERIFY_SUCCESS_MSG = "User Login Successful";
    public static final String API_VALIDATION_FAILURE = "Validation error details";

    public static final String API_FAILURE_COMMON_MESSAGE = "Something went wrong. Please try after sometime";

    public static final String OTP_PREFIX = "otp:";
    public static final String LOGGED_IN_PREFIX = "login:verified:";

    public static final String USER_ID_HEADER = "X-User-Id";
    public static final String ROLES_HEADER = "X-Roles";
    public static final String TENANT_ID_HEADER = "X-Tenant-Id";

    public static final String ROLE_CREATION_SUCCESS_MSG = "Role Imported Successfully";
    public static final String USER_ACTIVE = "Active";
    public static final String USER_INACTIVE = "Inactive";

    public static final String ACCESS_DENIED_MSG = "Access Denied: You are not valid or don't have permission to access.";

    public static final String DEFAULT_PASSWORD = "changeMe@123";
    public static final String TENANT_CODE_PREFIX = "IMS-";
}
