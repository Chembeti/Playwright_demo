Feature: User Authentication tests

  Background: 
    Given User navigates to the application
    
  Scenario: Login should pass
    And User enters the username as "chemba01"
    And User enters the password as "enterPwd"
    When User clicks on the login button
    Then Login should pass

  Scenario: Login should fail
    Given User enters the username as "chemba01"
    Given User enters the password as "pass123"
    When User clicks on the login button
    But Login should fail
