# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from . import __version__ as app_version

app_name = "frappe_youtube"
app_title = "Frappe YouTube Upload"
app_publisher = "Dirk van der Laarse"
app_description = "Upload videos to YouTube from Frappe via YouTube API"
app_icon = "octicon octicon-device-camera-video"
app_color = "red"
app_email = "dirk@laarse.co.za"
app_license = "gpl-3.0"

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/frappe_youtube/css/frappe_youtube.css"
# app_include_js = "/assets/frappe_youtube/js/frappe_youtube.js"

# include js, css files in header of web template
# web_include_css = "/assets/frappe_youtube/css/frappe_youtube.css"
# web_include_js = "/assets/frappe_youtube/js/frappe_youtube.js"

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Website user home page (by function)
# get_website_user_home_page = "frappe_youtube.utils.get_home_page"

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Installation
# ------------

# before_install = "frappe_youtube.install.before_install"
# after_install = "frappe_youtube.install.after_install"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "frappe_youtube.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
#	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"frappe_youtube.tasks.all"
# 	],
# 	"daily": [
# 		"frappe_youtube.tasks.daily"
# 	],
# 	"hourly": [
# 		"frappe_youtube.tasks.hourly"
# 	],
# 	"weekly": [
# 		"frappe_youtube.tasks.weekly"
# 	]
# 	"monthly": [
# 		"frappe_youtube.tasks.monthly"
# 	]
# }

# Testing
# -------

# before_tests = "frappe_youtube.install.before_tests"

# Overriding Whitelisted Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "frappe_youtube.event.get_events"
# }


fixtures = [
    {"dt":"Custom Script", "filters": [["dt", "in", ("Training Event", "Step")]]},
    {"dt":"Custom Field", "filters": [["dt", "in", ("Training Event", "Step")]]}
    ]
