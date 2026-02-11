Feature: Housing System
  Players can rent housing at their current location for a daily gold cost.
  Housing is location-locked and resets when the player changes location.

  Background:
    Given a new game has started

  Scenario: Player can rent housing at current location
    Given the player is in "slums"
    When the player selects "tent" housing
    Then the player's current housing should be "tent"

  Scenario: Housing costs gold per day
    Given the player has 10 gold
    And the player has "tent" housing at 1 gold/day
    When 1 game tick passes
    Then the player's gold should decrease by 1

  Scenario: Housing resets on location change
    Given the player has "tent" housing
    When the player changes location to "fields"
    Then the player's current housing should be null

  Scenario: Player is evicted when unable to afford housing
    Given the player has 0 gold
    And the player has "tent" housing
    When 1 game tick passes
    Then the player's current housing should be null

  Scenario: Housing options are filtered by location
    Given the player is in "slums"
    Then only housing for "slums" should be available
