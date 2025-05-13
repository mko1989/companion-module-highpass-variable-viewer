# Companion Module: Variable Viewer

This Bitfocus Companion module works in conjunction with the "Companion Variable Viewer" desktop application. It sends variable data from Companion to the application, allowing you to display Companion variables on a custom webpage.

## Features

*   Connects to the Companion Variable Viewer application via WebSockets.
*   Provides 10 internal variables (`text_1` to `text_10`) that can be updated.
*   Includes a "Set Text Variable" action to update these variables from Companion buttons or triggers.
*   Automatically sends variable updates to the viewer application.

## Installation

1.  Ensure the "Companion Variable Viewer" application is running or accessible on your network.
2.  Install this module into your Bitfocus Companion setup (e.g., by cloning this repository into your Companion modules directory or via other standard Companion module installation methods).

## Configuration

When adding this module in Companion, you will need to configure the following:

*   **Target IP:** The IP address of the machine running the Companion Variable Viewer application.
    *   Default: `127.0.0.1`
*   **Target Port:** The port number the Companion Variable Viewer application is listening on.
    *   Default: `3333` (This must match the port configured in the Variable Viewer application).

## Usage

Please refer to the `HELP.md` file within this module's directory for detailed instructions on how to set up and use this module effectively with the Companion Variable Viewer application.

## Link to App
https://github.com/mko1989/companion-variable-viewer
