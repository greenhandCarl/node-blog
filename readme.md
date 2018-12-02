### 启动mongodb
找到mongodb文件夹下bin的路径    
例如： ’C:\Program Files\MongoDB\Server\3.6\bin‘    
打开cmd命令行cd到该目录下    
找到需要启动得项目下的db文件夹    
例如： ’C:\Users\Administrator\Desktop\blog\db‘    
输入命令： mongod dbpath='C:\Users\Administrator\Desktop\blog\db'    
命令行显示wait for connect即表示数据库启动成功    
cd到该项目跟目录输入： node app.js    
显示数据库连接成功即可访问localhost:3000