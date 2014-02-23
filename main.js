/*
 * Copyright (c) 2014 Jacob Lauritzen.
 *
 * Licensed under MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window, CodeMirror */

define(function (require, exports, module) {
    "use strict";

    var CommandManager      = brackets.getModule("command/CommandManager"),
        Menus               = brackets.getModule("command/Menus"),
        PreferencesManager  = brackets.getModule("preferences/PreferencesManager"),
        ExtensionUtils      = brackets.getModule("utils/ExtensionUtils"),
        FileSystem          = brackets.getModule("filesystem/FileSystem");

	var preferences = PreferencesManager.getPreferenceStorage("extensions.Themes-for-brackets"),
        menu = Menus.addMenu("Themes", "themes-for-brackets", Menus.AFTER, Menus.AppMenuBar.VIEW_MENU),
        moduleThemesDir = ExtensionUtils.getModulePath(module, "themes/"),
		customThemesDir = brackets.app.getApplicationSupportDirectory() + "/custom themes/";

	
	var Themes = {};
	
	// If there is no currently selected theme, use default
	Themes.currentTheme = preferences.getValue("theme");
    if (Themes.currentTheme === undefined) {
        preferences.setValue("theme", "default");
		Themes.currentTheme = "default";
    }
	
	var __custom = preferences.getValue("isCustom");
    if (__custom === undefined) {
        preferences.setValue("isCustom", false);
        __custom = false;
    }
	
	Themes.getName = function (theme) {
		theme = theme || Themes.currentTheme;
		theme = theme.replace(new RegExp("-", "g"), " ");
		return theme.charAt(0).toUpperCase() + theme.slice(1);
	};
	
	Themes.load = function (theme, isCustom) {
		$("#editor-holder .CodeMirror").removeClass("cm-s-" + Themes.currentTheme);
		Themes.setCommand(Themes.currentTheme, false);
		Themes.currentTheme = theme;
		if (isCustom) {
			$("#currentTheme").attr("href", customThemesDir + Themes.currentTheme + ".css");
			preferences.setValue("isCustom", true);
		} else {
			$("#currentTheme").attr("href", moduleThemesDir + Themes.currentTheme + ".css");
			preferences.setValue("isCustom", false);
			if (theme !== "visual-studio" && theme !== "default") {
				$("#baseStyle").attr("href", ExtensionUtils.getModulePath(module, "") + "dark.css");
			} else {
				$("#baseStyle").attr("href", "");
			}
		}
		Themes.setCommand(Themes.currentTheme, true);
		preferences.setValue("theme", Themes.currentTheme);
		CodeMirror.defaults.theme = Themes.currentTheme;
		$("#editor-holder .CodeMirror").addClass("cm-s-" + Themes.currentTheme);
	};
	
	Themes.setCommand = function (theme, val) {
		CommandManager.get("jacse.themes-for-brackets.changetheme_" + theme).setChecked(val);
	};

	function addCommand(theme, isCustom) {
		var command = "jacse.themes-for-brackets.changetheme_" + theme;
		CommandManager.register(Themes.getName(theme), command, function () {
			Themes.load(theme, isCustom);
		});
		menu.addMenuItem(command);
	}
	
	
	// Pass file names as an array and create the themes
    Themes.getDirFiles = function (themesNameArray) {
        var i,
            len = themesNameArray.length,
            findDefault = themesNameArray.indexOf('default');
        if (findDefault !== -1) { //make sure default theme is on top
            themesNameArray = themesNameArray.splice(findDefault, 1).concat(themesNameArray);
        }
        for (i = 0; i < len; i++) {
            if (themesNameArray[i].indexOf(".css") > -1) { //I know this is a stupid way to check whether a theme is custom, but hey!
                addCommand(themesNameArray[i].replace(".css", ""), true);
            } else {
                addCommand(themesNameArray[i]);
            }
        }
	    $("body").append('<link id="themesCss" rel="stylesheet" href="' + ExtensionUtils.getModulePath(module, "") + 'stuff.css"/>');
        $("body").append('<link id="currentTheme" rel="stylesheet"/>');
	    $("body").append('<link id="baseStyle" rel="stylesheet"/>');
		
        Themes.load(Themes.currentTheme, __custom);
    };
	

    // Get standard themes
    console.log("Getting contents of themes directory...");
	FileSystem.getDirectoryForPath(moduleThemesDir).getContents(function (err, contents) {
		if (err) {
			console.log("Error getting themes:" + err);
		}
		var themesInDir = [], i;
		for (i = 0; i < contents.length; i++) {
			themesInDir.push(contents[i].name.replace(".css", ""));
		}
		
		//Make sure custom themes directory exists
		console.log("Creating custom themes directory...");
		FileSystem.getDirectoryForPath(customThemesDir).create(function () {
			// Get custom themes
			console.log("Getting contents of custom themes directory...");
			FileSystem.getDirectoryForPath(customThemesDir).getContents(function (err, contents) {
				if (err) {
					console.log("Error getting custom themes:" + err);
				}
				var themesInDir2 = [], i;
				for (i = 0; i < contents.length; i++) {
					themesInDir2.push(contents[i].name);
				}
				console.log("Adding all themes to themes menu...");
				Themes.getDirFiles(themesInDir.concat(themesInDir2));
			});
		});
	});
	
});
