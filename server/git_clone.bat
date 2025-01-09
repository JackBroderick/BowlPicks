git add .
git commit -m "Changes committed"
cd..
net use g: \\home_pc\nicole /user:chris 1559
rmdir g:\chris\development\bowlcuptng\server /s /q
git clone  ./server g:/chris/development/bowlcuptng/server
net use g: /delete