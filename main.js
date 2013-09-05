/*
 * Copyright (c) 2013 Jacob Lauritzen.
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
        NativeFileSystem    = brackets.getModule("file/NativeFileSystem").NativeFileSystem;

	var preferences = PreferencesManager.getPreferenceStorage("extensions.Themes-for-brackets"),
        menu = Menus.addMenu("Themes", "themes-for-brackets", Menus.AFTER, Menus.AppMenuBar.VIEW_MENU),
        moduleThemesDir = ExtensionUtils.getModulePath(module, "themes/");

	// If there is no currently selected theme, use default
	var __theme = preferences.getValue("theme");
	if (__theme === undefined) {
		preferences.setValue("theme", "default");
		return;
	}

	var Themes = {};
	Themes.currentTheme = __theme;
	Themes.getName = function (theme) {
		theme = theme || Themes.currentTheme;
		theme = theme.replace(new RegExp("-", "g"), " ");
		return theme.charAt(0).toUpperCase() + theme.slice(1);
	};
	Themes.load = function (theme) {
		Themes.setCommand(Themes.currentTheme, false);
		if (theme) {
			Themes.currentTheme = theme;
		}
		$("#currentTheme").attr("href", moduleThemesDir + Themes.currentTheme + ".css");
		Themes.setCommand(Themes.currentTheme, true);
		preferences.setValue("theme", Themes.currentTheme);
		CodeMirror.defaults.theme = Themes.currentTheme;
		$("#editor-holder .CodeMirror").addClass("cm-s-" + Themes.currentTheme);
	};
	Themes.setCommand = function (theme, val) {
		CommandManager.get("jacse.themes-for-brackets.changetheme_" + theme).setChecked(val);
	};

	function Theme(theme) {
		this.theme = theme;
		this.command_id = "jacse.themes-for-brackets.changetheme_" + theme;
		var that = this;
		CommandManager.register(Themes.getName(this.theme), this.command_id, function () {
			Themes.load(that.theme);
		});
		menu.addMenuItem(this.command_id);
	}

	// Pass file names as an array and create the Themes
    Themes.getDirFiles = function (themesNameArray) {
        var i,
            len = themesNameArray.length,
            findDefault = themesNameArray.indexOf('default');
        if (findDefault !== -1) {
            themesNameArray = themesNameArray.splice(findDefault, 1).concat(themesNameArray);
        }
        Themes.allThemes = [];
        for (i = 0; i < len; i += 1) {
            Themes.allThemes.push(new Theme(themesNameArray[i]));
        }
        $("body").append('<link id="currentTheme" rel="stylesheet"/>');
        $("body").append('<style>.CodeMirror-scroll{background-color:transparent}.CodeMirror-gutters{border-right:none}#status-indicators,#status-info{background:transparent;color:inherit;}.CodeMirror-activeline-background {background:none;}</style>');
        Themes.load(Themes.currentTheme);
    };

    // Get the theme directory file names without the .css extension
    NativeFileSystem.requestNativeFileSystem(moduleThemesDir, function (rootEntry) {
        rootEntry.root.createReader().readEntries(function (entries) {
            var i,
                fetching = [],
                len = entries.length;
            for (i = 0; i < len; i += 1) {
                fetching.push(entries[i].name.replace(".css", ""));
            }
            $.when.apply(module, fetching).done(Themes.getDirFiles(fetching));
        });
    });
});