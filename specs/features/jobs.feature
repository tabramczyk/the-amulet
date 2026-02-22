Feature: Jobs System
  Jobs provide XP and money per tick. Jobs have requirements
  and are locked to specific locations.

  # Summary: Jobs give XP + money per tick. Requirements: skill levels + previous jobs.
  # Location-locked. Reincarnation bonus = 15% per lifetime level. 10 jobs across 3 locations.

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
    Given the player has "strength" at level 5
    When the player tries to start the "laborer" job
    Then the job should be unavailable
    Because "laborer" requires Strength level 10

  Scenario: Job unlocks when requirements met
    Given the player has "strength" at level 10
    And the player is in "village"
    When the player tries to start the "laborer" job
    Then the job should be available

  Scenario: Job requires previous job level
    Given the player has "beggar" at level 9
    When the player checks if "scavenger" is available
    Then the job should be unavailable
    Because "scavenger" requires Beggar level 10

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

  Scenario: Slums has a linear job chain
    Given the player is in "slums"
    Then "beggar" job should be available with no requirements
    And "scavenger" job should require Beggar level 10
    And "errand_runner" job should require Scavenger level 10 and Endurance level 5

  Scenario: Fields has a branching job structure
    Given the player is in "fields"
    Then "fisherman" job should be available with no job requirements
    And "farmer" job should require Fisherman level 5 and Strength level 5
    And "shepherd" job should require Fisherman level 5 and Endurance level 5
    And "woodcutter" job should require Farmer level 10 and Strength level 10
    And "hunter" job should require Shepherd level 10 and Endurance level 10

  Scenario: Errand Runner unlocks travel to Fields
    Given the player has "errand_runner" at level 10
    When the player tries to travel to "fields"
    Then travel should be available

  Scenario: Woodcutter or Hunter unlocks travel to Village
    Given the player has "woodcutter" at level 5
    When the player tries to travel to "village"
    Then travel should be available

  Scenario: Hunter also unlocks travel to Village
    Given the player has "hunter" at level 5
    When the player tries to travel to "village"
    Then travel should be available
