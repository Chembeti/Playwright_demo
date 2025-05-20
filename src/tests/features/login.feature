Feature: User Authentication tests

  Background: 
    Given User navigates to the application
    
  Scenario: Login should pass
    And logs-in as "json://LOGIN_USER_DATA#appAdminUser"
    Then Login should pass

  Scenario: Login should fail
    And User enters the username as "invalidUser"
    * User enters the password as "pass123"
    When User clicks on the login button
    But Login should fail
