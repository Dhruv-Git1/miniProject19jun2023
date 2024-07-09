const express= require('express');
const app= express();
const cookieParser= require('cookie-parser');
const userModel= require("./models/user");
const bcrypt = require('bcrypt');
const jwt= require('jsonwebtoken');  //for log in-out purposes
const postModel= require("./models/post");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());   //it again took me a loooot of time to figure out that I have not written the const cookieparser line thats why the code is not working

app.get('/',(req,res)=>{
    res.render("index");  //we have used ejs so can use render  !!SO THATS THE USE OF EJS
});

app.post('/register',async (req,res)=>{
  //account banane se pahle check kare ki uss user ka koi account to nahi hai ussi email se
let{email,password, username,name,age}=req.body; 
let user = await userModel.findOne({email});
if(user) return res.status(500).send("you are already registered prabhu");  //will talk about this status in future
     //currenty no doing error handling like what if form filled incompletely
    //  if user not found then create the user
    bcrypt.genSalt(10,(err,salt)=>{
      bcrypt.hash(password, salt, async (err,hash)=>{
    let user= await userModel.create({
          username,
          email,
          age,
          name,
          password:hash
        })
       let token= jwt.sign({email:email,userid:user._id }, "shhh");//here done shhh aise hi. later we'll learn to do this 
      res.cookie("token", token);
      res.send("registered");
      
      })
    })
});

app.get('/login',(req,res)=>{
  res.render("login");  
});
app.post('/login',async (req,res)=>{
// check ki uss email ka user hai bhi ya nahi
let{email,password }=req.body; 
let user = await userModel.findOne({email});
if(!user) return res.status(500).send("you are not registered");  //will talk about this in future
    
  //now ab user hai...now possible that password not matching
  bcrypt.compare(password, user.password,function(err,result){   //it is typed password, real password  //no need to learn the syntax. just see the documentation
    if(result)
      {
        let token= jwt.sign({email:email,userid:user._id }, "shhh");//here done shhh aise hi. later we'll learn to do this 
    res.cookie("token", token);
    res.status(200).render("profile");
      }
    else res.redirect("login");
  })
});

app.get("/profile", isLoggedIn, async (req,res)=>{
      let user = await userModel.findOne({email: req.user.email}).populate("posts");            // !!!NEW   by doing populate we can see the content of our post
  res.render('profile', {user});  // !!!NEW !!we are sending the user data on the profile page
})


app.get('/logout',(req,res)=>{
  res.cookie("token", "");
  res.redirect("login");
});



app.post("/post", isLoggedIn, async (req,res)=>{     //will write post when user is logged in
  let user = await userModel.findOne({email: req.user.email});
  let {content}   = req.body;
   let post = await postModel.create({
        user:user._id,      //post ko ab pata hai user kon hai               
     content                 //no need of date since date is current date
      })

user.posts.push(post._id);
await user.save();

res.redirect("/profile");
})




//like
app.get("/like/:id", isLoggedIn, async (req,res)=>{
  let post = await postModel.findOne({_id: req.params.id}).populate("user");         //so ab isme id ki jagah data aa jayega  
   if(post.likes.indexOf(req.user.userid)===-1){
    post.likes.push(req.user.userid);
   }
   else{
    post.likes.splice(post.likes.indexOf(req.user.userid),1);   //splice=>hatao, iss id vale ko hatao and kitne bande hatao-->1
   }
     await post.save();
  res.redirect('/profile', {user});  //!we are sending the user data on the profile page
})





//middle ware for protected route
function isLoggedIn(req, res, next){
  if(req.cookies.token==="") res.render("login");
  else{ 
    let data= jwt.verify(req.cookies.token, "shhh");   //check karo ki valid token hai na
    req.user = data;     // req ke andar user banaya and data uske andar gar dia  .... token hamara req.cookies.token ke andar hai 
    next();            //vo wala data milega jab token pahli baar set kia tha  
  }
}

app.listen(3000);