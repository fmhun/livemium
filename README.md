#Livemium

##Installation

Livemium can be installed from `npm` by running the `ìnstall` command in a terminal. It's recommanded to use a gloabal install by adding option `-g` :
	 
	 $ npm install livemium -g

##Usage

Livemium provide a command line tool to start a server that watch your titanium project and send new JSS to connected clients.
Then, run the livemium server to watch for jss changes in your Titanium project, you need to specify the path of your project where the tiapp.xml is located :

	$ livemium watch [titanium/project/path] -p 8160

The `-p` option is the port number your server will listen to.

#Contributors

+ Antoine Joulie

#License

The MIT License

Copyright (c) 2012 Florian Mhun <florian.mhun@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
