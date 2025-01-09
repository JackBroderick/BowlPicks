git add .
git commit -m "Changes committed"
cd..
net use g: \\home_pc\nicole /user:chris 1559
rmdir g:\chris\development\bowlcuptng\web /s /q
git clone  ./web g:/chris/development/bowlcuptng/web
net use g: /delete