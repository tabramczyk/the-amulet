Feature: Time System
  The game uses a tick-based time system where 1 tick = 1 in-game day.
  Time only advances when the player has an active continuous action.

  Background:
    Given a new game has started
    And the player is age 16

  Scenario: Time does not advance without active action
    Given no continuous action is active
    When 1 real second passes
    Then the current day should not change
    And the player age should be 16

  Scenario: Time advances with continuous action
    Given the continuous action "begging" is active
    When enough real time passes for 1 tick
    Then the current day should increase by 1

  Scenario: Real time to game time conversion
    Given the continuous action "begging" is active
    When 1 real second passes
    Then approximately 4.46 game days should have passed

  Scenario: Player ages over time
    Given the continuous action "begging" is active
    When 365 game days have passed
    Then the player age should be 17

  Scenario: Click action consumes time
    Given a click action with timeCostDays of 5
    When the player performs the click action
    Then the current day should increase by 5

  Scenario: Instant click action does not consume time
    Given a click action with timeCostDays of 0
    When the player performs the click action
    Then the current day should not change

  Scenario: Fractional ticks accumulate
    Given the continuous action "begging" is active
    When real time passes for less than 1 full tick
    Then the fractional time should be accumulated
    And no game day should advance yet

  Scenario: Day display shows day within current year
    Given the continuous action "begging" is active
    When 400 game days have passed
    Then the displayed day should be 35
    And the player age should be 17
