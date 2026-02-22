Feature: Locations System
  Locations control available jobs and training actions.
  Changing location stops current continuous action.

  # Summary: 3 locations (slums → fields → village). Control available jobs/actions.
  # Require job levels to unlock. Changing location stops continuous actions.

  Background:
    Given a new game has started

  Scenario: Player starts in Slums
    Then the player should be in "slums"
    And "beggar" job should be available
    And "concentration" training should be available

  Scenario: Traveling to a new location costs time
    Given the player is in "slums"
    When the player travels to "fields"
    Then game days should be consumed for travel
    And the player should be in "fields"

  Scenario: Changing location stops continuous action
    Given the player is in "slums"
    And the continuous action "begging" is active
    When the player travels to "fields"
    Then no continuous action should be active

  Scenario: Fields requires Errand Runner level 10
    Given the player has "errand_runner" job at level 9
    When the player tries to travel to "fields"
    Then travel should be unavailable
    Because "fields" requires Errand Runner level 10

  Scenario: Fields unlocks with Errand Runner level 10
    Given the player has "errand_runner" job at level 10
    When the player tries to travel to "fields"
    Then travel should be available

  Scenario: Village requires Woodcutter 5 OR Hunter 5
    Given the player has "woodcutter" job at level 4
    And the player has "hunter" job at level 4
    When the player tries to travel to "village"
    Then travel should be unavailable

  Scenario: Village unlocks with Woodcutter level 5
    Given the player has "woodcutter" job at level 5
    When the player tries to travel to "village"
    Then travel should be available

  Scenario: Village unlocks with Hunter level 5
    Given the player has "hunter" job at level 5
    When the player tries to travel to "village"
    Then travel should be available

  Scenario: Available jobs change by location
    Given the player is in "fields"
    Then "fisherman" job should be available
    And "beggar" job should not be available

  Scenario: Slums has three jobs available
    Given the player is in "slums"
    Then "beggar" job should be available
    And "scavenger" job should be available
    And "errand_runner" job should be available

  Scenario: Fields has five jobs available
    Given the player is in "fields"
    Then "fisherman" job should be available
    And "farmer" job should be available
    And "shepherd" job should be available
    And "woodcutter" job should be available
    And "hunter" job should be available
