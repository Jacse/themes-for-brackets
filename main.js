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
        FileSystem          = brackets.getModule("filesystem/FileSystem");

	var preferences = PreferencesManager.getPreferenceStorage("extensions.Themes-for-brackets"),
		fontMenu = Menus.addMenu("Font", "fonts-for-brackets", Menus.AFTER, Menus.AppMenuBar.VIEW_MENU),
        menu = Menus.addMenu("Themes", "themes-for-brackets", Menus.AFTER, Menus.AppMenuBar.VIEW_MENU),
        moduleThemesDir = ExtensionUtils.getModulePath(module, "themes/");

	
	// If there is no currently selected theme, use default
	var __theme = preferences.getValue("theme");
    if (__theme === undefined) {
        preferences.setValue("theme", "default");
        return;
    }
	
	/* var __font = preferences.getValue("font");
    if (__font === undefined) {
        preferences.setValue("font", "Default");
        return;
    } */
	
	var Themes = {};
	Themes.currentTheme = __theme;
	//Themes.currentFont = __font;
	Themes.getName = function (theme) {
		theme = theme || Themes.currentTheme;
		theme = theme.replace(new RegExp("-", "g"), " ");
		return theme.charAt(0).toUpperCase() + theme.slice(1);
	};
	
	Themes.load = function (theme) {
		$("#editor-holder .CodeMirror").removeClass("cm-s-" + Themes.currentTheme);
		Themes.setCommand("theme", Themes.currentTheme, false);
		Themes.currentTheme = theme;
		$("#currentTheme").attr("href", moduleThemesDir + Themes.currentTheme + ".css");
		Themes.setCommand("theme", Themes.currentTheme, true);
		preferences.setValue("theme", Themes.currentTheme);
		CodeMirror.defaults.theme = Themes.currentTheme;
		$("#editor-holder .CodeMirror").addClass("cm-s-" + Themes.currentTheme);
	};
	
	Themes.setCommand = function (fontortheme, theme, val) {
		CommandManager.get("jacse." + fontortheme + "s-for-brackets.change" + fontortheme + "_" + theme).setChecked(val);
	};

	function addCommand(theme) {
		var command = "jacse.themes-for-brackets.changetheme_" + theme;
		CommandManager.register(Themes.getName(theme), command, function () {
			Themes.load(theme);
		});
		menu.addMenuItem(command);
	}
	
	
	// Pass file names as an array and create the Themes
    Themes.getDirFiles = function (themesNameArray) {
        var i,
            len = themesNameArray.length,
            findDefault = themesNameArray.indexOf('default');
        if (findDefault !== -1) {
            themesNameArray = themesNameArray.splice(findDefault, 1).concat(themesNameArray);
        }
        for (i = 0; i < len; i++) {
            addCommand(themesNameArray[i]);
        }
        $("body").append('<link id="currentTheme" rel="stylesheet"/>');
		$("body").append('<link id="themesCss" rel="stylesheet" href="' + ExtensionUtils.getModulePath(module, "") + 'stuff.css"/>');
        Themes.load(Themes.currentTheme);
    };
	
    // Get the theme directory file names without the .css extension
    var path = FileSystem.getDirectoryForPath(moduleThemesDir);
	path.getContents(function (err, contents) {
		var themesInDir = [],
			i;
		for (i = 0; i < contents.length; i++) {
			themesInDir.push(contents[i].name.replace(".css", ""));
		}
		Themes.getDirFiles(themesInDir);
	});

	
	
	/*
	 * FONTS Disabled.
	 */
	/*
	Themes.loadFont = function (font) {
		Themes.setCommand("font", Themes.currentFont, false);
		if (font === "Default") {
			$("#styleFont").html('');
			$("#editor-holder .CodeMirror").removeClass("themeFont");
		} else {
			$("#styleFont").html("@font-face {font-family: 'themeFont';src: url('" + ExtensionUtils.getModulePath(module, "fonts/") + font + ".woff') format('woff');font-weight: normal;font-style: normal;} .themeFont{font-family:'themeFont'}");
			$("#editor-holder .CodeMirror").addClass("themeFont");
		}
		Themes.currentFont = font;
		preferences.setValue("font", Themes.currentFont);
		Themes.setCommand("font", Themes.currentFont, true);
	};
	
	function addFontCommand(font) {
		var command = "jacse.fonts-for-brackets.changefont_" + font;
		CommandManager.register(font, command, function () {
			Themes.loadFont(font);
		});
		fontMenu.addMenuItem(command);
	}
	
	var fontArray = ["Default", "VeraMono", "Inconsolata"],
		i;
	
	for (i = 0; i < fontArray.length; i++) {
		addFontCommand(fontArray[i]);
    }
	
	$("body").append('<style id="styleFont"></style>');
	*/
});
