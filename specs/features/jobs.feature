Feature: Jobs System
  Jobs provide XP and money per tick. Jobs have requirements
  and are locked to specific locations.

  Background:
    Given a new game has started

  Scenario: Working a job earns XP and money
    Given the player is working as "beggar" in "slums"
    When 1 game tick passes
    Then the player should earn beggar XP
    And the player should earn money

  Scenario: Job levels up when XP threshold reached
    Given the player has "beggar" job at level near threshold
    When enough XP is gained to reach the threshold
    Then the "beggar" job should level up

  Scenario: Job requires minimum skill level
    Given the player has "strength" at level 30
    When the player tries to start the "laborer" job
    Then the job should be unavailable
    Because "laborer" requires Strength level 40

  Scenario: Job unlocks when requirements met
    Given the player has "strength" at level 40
    And the player is in "village"
    When the player tries to start the "laborer" job
    Then the job should be available

  Scenario: Job requires previous job level
    Given the player has "beggar" at level 9
    When the player checks if "farmer" is available
    Then the job should be unavailable
    Because "farmer" requires Beggar level 10

  Scenario: Job requires correct location
    Given the player is in "slums"
    When the player tries to start the "farmer" job
    Then the job should be unavailable
    Because "farmer" is only available in "fields"

  Scenario: Reincarnation bonus applies to job XP
    Given the player has 15 total lifetime levels in "beggar" job
    And the player is working as "beggar"
    When 1 game tick passes
    Then the beggar XP gain should include a 15% reincarnation bonus
