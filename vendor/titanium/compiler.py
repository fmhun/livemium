#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Compile Ti application css into json string and output the result

import os,codecs,time,types,sys,json

import css.csscompiler as cssc
from tiapp import *

if len(sys.argv)==1 or len(sys.argv) < 3:
	print "Livemium JSS Compiler"
	print "Usage: %s <project_dir> <platform>" % os.path.basename(sys.argv[0])
	sys.exit(1)

platform = sys.argv[2]
output = { 'platform': platform, 'css': { 'ids': None, 'classes': None }, 'error': None }

path = os.path.expanduser(sys.argv[1])
if not os.path.exists(path):
	output['error'] = "Project directory not found: %s" % path
	print json.dumps(output)
	sys.exit(1)

tiapp_xml_path = os.path.join(path,'tiapp.xml')
if not os.path.exists(tiapp_xml_path):
	output['error'] = "Project directory doesn't look like a valid Titanium project: %s" % path
	print json.dumps(output)
	sys.exit(1)	

resources_dir = os.path.join(path,'Resources')
	
if not os.path.exists(resources_dir):
	output['error'] = "Project directory doesn't look like a valid Titanium project: %s" % path
	print json.dumps(output)
	sys.exit(1)

tiapp = TiAppXML(tiapp_xml_path)
app_id = tiapp.properties['id']
prefixs = { 
	'android': 'global',
	'iphone':  'app'
}

c = cssc.CSSCompiler(resources_dir,platform,app_id)
output['css']['ids']     = c.ids[prefixs[platform]]
output['css']['classes'] = c.classes[prefixs[platform]]

print json.dumps(output)