import frappe
from frappe import _


@frappe.whitelist()
def get_youtube_iframe(youtube_video):
    youtube_video = frappe.get_doc("YouTube Video", youtube_video)
    if youtube_video.video_url is not None:
        string = '<iframe width="560" height="315" src="https://www.youtube.com/embed/' + youtube_video.video_url + '?cc_load_policy=1&modestbranding=1" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    else:
        string = 'No video defined'
    return string