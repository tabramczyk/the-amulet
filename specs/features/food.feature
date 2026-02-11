Feature: Food System
  Players can buy daily food for a gold cost.
  Food is available in all locations and persists across location changes.

  Background:
    Given a new game has started

  Scenario: Player can select food
    When the player selects "scraps" food
    Then the player's current food should be "scraps"

  Scenario: Food costs gold per day
    Given the player has 10 gold
    And the player has "scraps" food at 1 gold/day
    When 1 game tick passes
    Then the player's gold should decrease by 1

  Scenario: Food persists across location changes
    Given the player has "bread" food
    When the player changes location to "fields"
    Then the player's current food should be "bread"

  Scenario: Player loses food when unable to afford expenses
    Given the player has 0 gold
    And the player has "bread" food
    When 1 game tick passes
    Then the player's current food should be null

  Scenario: Food and housing costs stack
    Given the player has 10 gold
    And the player has "tent" housing at 1 gold/day
    And the player has "scraps" food at 1 gold/day
    When 1 game tick passes
    Then the player's gold should decrease by 2
