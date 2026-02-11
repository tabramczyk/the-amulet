Feature: Skills System
  Skills gain XP while relevant training actions are active.
  Skills have soft caps per life and are affected by prestige bonuses.

  Background:
    Given a new game has started

  Scenario: Skill gains XP from training action
    Given the player is training "concentration"
    When 1 game tick passes
    Then the "concentration" skill should gain base XP

  Scenario: Skill levels up when XP threshold reached
    Given the player has "strength" at level 4 with XP near threshold
    When enough XP is gained to reach the threshold
    Then the "strength" skill should be level 5
    And the XP should reset for the next level

  Scenario: Soft cap reduces XP gain
    Given the player has "strength" at level 50 (at soft cap)
    When 1 game tick of training passes
    Then the XP gained should be 10% of normal

  Scenario: Below soft cap gives full XP
    Given the player has "strength" at level 10 (below soft cap of 50)
    When 1 game tick of training passes
    Then the XP gained should be 100% of normal

  Scenario: Concentration provides XP bonus to all skills
    Given the player has "concentration" at level 10
    And the player is training "strength"
    When 1 game tick passes
    Then the "strength" XP gain should include a 10% concentration bonus

  Scenario: Prestige bonus increases XP gain
    Given the player has 20 total lifetime levels in "strength"
    And the player is training "strength"
    When 1 game tick passes
    Then the "strength" XP gain should include a 20% prestige bonus

  Scenario: No XP gain without active training
    Given no continuous action is active
    When 1 game tick passes
    Then no skill should gain XP
