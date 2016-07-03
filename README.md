GameFAQs AMP Sorting
======================================
Sort your Active Messages Posted on the GameFAQs Message Boards by "Board", "Topic", "Msgs", "Last Post", or "Your Last Post" in ascending or descending order by clicking on the respective header.

Use with one of the following browser extensions:

### Mozilla Firefox ###
*	[Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
*	[Scriptish](https://addons.mozilla.org/en-US/firefox/addon/scriptish/)

### Google Chrome ###
*	[Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
*	Convert script to Google Chrome extension:

	>1. Save the script (the `*.user.js` file) to your computer.
	>2. In Chrome, go to _Tools > Extensions_.
	>3. Drag/drop the user script file onto the _Extensions_ page.

Release Notes
=============

Version 2.1.0
-------------
_Released 2016-07-02_

*	Optimized process used to select the correct stylesheet of the active site display style
*	Completely transitioned from GM_*etValue functions to native localStorage

Version 2.0.3
-------------
_Released 2016-03-21_

*	Updated to use new FontAwesome classes after recent GameFAQs font update
*	Switch to only using `localStorage` for sort settings

Version 2.0.2
-------------
_Released 2015-09-29_

*	Updated to account for GameFAQs updates to site URLs
*	Small tweaks to speed things up

Version 2.0.1
-------------
_Released 2015-09-27_

*	Removed lines from beginning of script that I don't remember putting there but apparently break the script for certain people (including myself >_>)
*	Now saves current sort settings to localStorage on load and on sort to ease future transition away from GM_* functions (specifically GM_*etValue)

Version 2.0.0
-------------
_Released 2014-09-14_

*	AMP Sorting has been completely rewritten from the ground up!
	*	Now displays native GameFAQs sorting options above AMP table to allow for usage of different GameFAQs sorting methods (which sorts ALL active messages, not just the current page) in conjunction with AMP Sorting script
*	Renamed script file to `GameFAQs_AMP_Sorting`
*	**IF UPDATING FROM A PREVIOUS VERSION THEN YOU MAY NEED TO UNINSTALL THE PREVIOUS VERSION OF THE SCRIPT.**

Version 1.2.5
-------------
_Released 2012-07-19_

*	Small update that allows script to override official GameFAQs sorting

Version 1.2.4
-------------
_Released 2012-05-10_

*	Sorting now takes the year into account

Version 1.2.3
-------------
_Released 2012-04-12_

*	Script now sorts friends' AMP properly when they have posts on boards that you do not have access to

Version 1.2.2
-------------
_Released 2012-04-02_

*	Removed auto-updater since Greasemonkey now has update checking built-in as of v0.9.18


Version 1.2.1
-------------
_Released 2011-10-15_

*	Fixed compatibility issues with GameFOX 0.8.2

#### Full changelog available at http://otacon120.com ####
