Feature: Locations System
  Locations control available jobs and training actions.
  Changing location stops current continuous action.

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

  Scenario: Location requires job level
    Given the player has "farmer" job at level 3
    When the player tries to travel to "village"
    Then travel should be unavailable
    Because "village" requires Farmer level 5

  Scenario: Location unlocks when requirements met
    Given the player has "beggar" job at level 5
    When the player tries to travel to "fields"
    Then travel should be available

  Scenario: Available jobs change by location
    Given the player is in "fields"
    Then "farmer" job should be available
    And "beggar" job should not be available
