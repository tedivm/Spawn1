
This is an extremely rough outline of the needed features. Items with a check
are currently functional, although they may need some design help.

## Pages

### Login ✓

  * Using Screeps API ✓


### Performance

  * Auto updating stats-
    * CPU
    * Bucket
    * Memory


### Overview (home)

  * Formatting
  * Username ✓
  * Badge
  * Credits ✓
  * GCL - Current Level
  * GCL - Current Total ✓
  * GCL - Tracking (current / next level)
  * GCL - Progress Bar

  * Power - Current Level
  * Power - Current Total ✓
  * Power - Tracking (current / next level)
  * Power - Progress Bar

  * Number of Rooms ✓

  * Control Ranking ✓
  * Power Ranking ✓

### Rooms

  * Listing - build graphics?
    * RCL
    * RCL Progress (if below RCL8)


### Market

  * List of Resources
  * Subpage for each resource.
    * Buy Orders
    * Sell Orders
    * Averages


### Orders ✓

  * List of Orders ✓
    * Slide to cancel ✓
    * Actually cancel order (via console api) ✓


### Wallet

  * History of Transactions ✓
  * Multiple Page Tracking ✓
  * Transaction Detail Page


### Messenger ✓

  * Index ✓
  * Conversation Page ✓
  * Reply to conversation ✓
  * New Conversation ✓


### Console

  * Read console results. ✓
  * Display console output. ✓
  * Support HTML displays. ✓
  * Submit console commands. ✓

  * Silence screeps-stats.

  * Add "interactive" mode that suppresses `log`.
    * Use CSS - allow "log" and "error" fields to be toggled

  * React to application state.
    * suspend/exit - kill websockets.
    * resume - restart websockets.
    * leave page - kill websockets. ✓


### Alliances

  * Listing of Alliances ✓
    * Include images from Leage website. ✓

  * Alliance Subpage ✓
    * Members ✓
    * Ranking Data


### Alliance Rankings

### User Leaderboards

  * Control Rankings
  * Power Rankings


### Screeps Observer

  Twitter feed from the @ScreepsObserver bot

### Server Status ✓

  * Average Tick Time ✓
  * Current Tick ✓
