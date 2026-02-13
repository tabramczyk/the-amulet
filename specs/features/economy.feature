Feature: Daily Economy
  Players earn gold from jobs and spend gold on housing and food each day.
  The net daily balance (earnings minus expenses) is displayed in the UI.
  With dual actions, earnings come from the active job action.

  Background:
    Given a new game has started

  Scenario: Net income displayed as earnings minus expenses
    Given the player is performing "begging" job action earning 1 gold/day
    And the player has "tent" housing at 1 gold/day
    Then the daily balance should show net 0 gold/day

  Scenario: Dual actions combine earnings from job action only
    Given the player is performing "begging" job action earning 1 gold/day
    And the player is performing "train_concentration" skill action
    Then the daily earnings should show 1 gold/day

  Scenario: Job payment shown per day
    Given the player is performing "begging" job action
    Then the job display should show "1 gold/day"

  Scenario: Job payment grows with level
    Given the player is performing "begging" job action
    And the player has "beggar" job at level 5
    Then the daily earnings should show 2 gold/day

  Scenario: Job payment grows further at level 10
    Given the player is performing "begging" job action
    And the player has "beggar" job at level 10
    Then the daily earnings should show 3 gold/day

  Scenario: Job payment at level 0 is base pay
    Given the player is performing "begging" job action
    And the player has "beggar" job at level 0
    Then the daily earnings should show 1 gold/day
