# -*- coding: utf-8 -*-
# Copyright (c) 2019, Dirk van der Laarse and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
# import frappe
from frappe.model.document import Document
import datetime

class YouTubeVideo(Document):
	def validate(self):
		# Set title on save
		self.title = str(datetime.date.today().year) + "-" + str(datetime.date.today().month).zfill(2)  + " " + self.video_name
