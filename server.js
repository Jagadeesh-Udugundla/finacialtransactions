const express = require("express")
const mongoose=require("mongoose")
const Registeruser=require('./usermodel.js')
const middleware=require('./middleware/middleware.js')
// const Carmodel=require("./carmodel.js")
const jwt= require('jsonwebtoken')
const cors= require('cors')
const app=express()

mongoose.connect("mongodb+srv://jagadeeshu9951:Rozi@cluster0.sojyxvn.mongodb.net/?retryWrites=true&w=majority").then(
    ()=>console.log("db connected")
)

app.use(express.json())

app.use(cors({origin:"*"}))

app.post('/register',async(req,res)=>{
    try{
        const {username,email,password,confirmpassword}=req.body;
        let exist = await Registeruser.findOne({email})
        if (exist){
            return res.status(400).send("User Already Registered")
        }
        if (password!==confirmpassword){
            return res.status(400).send("Password not matching")
        }
        let newUser=new Registeruser({
            username,
            email,
            password,
            confirmpassword
        })
        await newUser.save()
        res.status(200).send("User Register Successfully")
    }catch(err){
        res.status(400).send("Internal server error")
        console.log(err)
    }
})

app.post('/login',async(req,res)=>{
    try{
        const {email,password}=req.body;
        let exist=await Registeruser.findOne({email})
        if (!exist){
            return res.status(400).send("Not Registered")
        }
        if (exist.password!==password){
            return res.status(400).send("Password did not match")
        }
        let payload={
            user:{
                id:exist.id
            }
        }
        jwt.sign(payload,"key",{expiresIn:3600000},
        (err,token)=>{
            if (err) throw err;
            return res.json({token})
        }
            )
            return res.json(exist._id)
    }
    catch(err){
        console.log(err)
        return res.status(500).send("server error")
    }
})

const TransactionModel = mongoose.model('Transaction', {
    id:String,
    date: String,
    category: String,
    amount: Number,
  });

  const MonthModel = mongoose.model('Month', {
    id:String,
    year: String,
    month: String,
    amount: Number,
  });

app.get('/transactions', async (req, res) => {
    try {
      const transactions = await TransactionModel.find();
      res.status(200).json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  app.get('/month', async (req, res) => {
    try {
      const transactions = await MonthModel.find();
      res.status(200).json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/transactions', async (req, res) => {
    try {
      const {id, date, category, amount } = req.body;
      if (!date || !category || isNaN(amount)) {
        return res.status(400).json({ error: 'Date, category, and valid amount are required fields.' });
      }
      const newTransaction = new TransactionModel({
        id,
        date,
        category,
        amount: parseFloat(amount),
      });
      await newTransaction.save();
      res.status(201).json({ message: 'Transaction added successfully', transaction: newTransaction });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/month', async (req, res) => {
    try {
      const {id, year,month, amount } = req.body;
      if (!year || !month || isNaN(amount)) {
        return res.status(400).json({ error: 'Date, category, and valid amount are required fields.' });
      }
      const newTransaction = new MonthModel({
        id,
        year,
        month,
        amount: parseFloat(amount),
      });
      await newTransaction.save();
      res.status(201).json({ message: 'Transaction added successfully', transaction: newTransaction });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.put('/transactions/:id', async (req, res) => {
    try {
        const transactionId = req.params.id;

        // Check if the transaction with the given ID exists
        const existingTransaction = await TransactionModel.findById(transactionId);
        if (!existingTransaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Update transaction details
        const { date, category, amount } = req.body;

        if (date) existingTransaction.date = date;
        if (category) existingTransaction.category = category;
        if (amount) existingTransaction.amount = parseFloat(amount);

        // Save the updated transaction
        await existingTransaction.save();

        res.status(200).json({ message: 'Transaction updated successfully', transaction: existingTransaction });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.put('/month/:id', async (req, res) => {
  try {
      const monthId = req.params.id;

      // Check if the month with the given ID exists
      const existingMonth = await MonthModel.findById(monthId);
      if (!existingMonth) {
          return res.status(404).json({ error: 'Month not found' });
      }

      // Update month details
      const { year, month, amount } = req.body;

      if (year) existingMonth.year = year;
      if (month) existingMonth.month = month;
      if (amount) existingMonth.amount = parseFloat(amount);

      // Save the updated month
      await existingMonth.save();

      res.status(200).json({ message: 'Month updated successfully', month: existingMonth });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/Home',middleware,async(req,res)=>{
    try{
        let exist = await Registeruser.findById(req.user.id)
        if (!exist){
            return res.status(400).send("user not found")
        }
        res.json(exist)
    }
    catch(err){
        console.log(err)
        return res.status(500).send("Internal Server error")
    }
})

app.delete('/transactions/:id', async (req, res) => {
    try {
        const transactionId = req.params.id;

        // Check if the transaction with the given ID exists
        const existingTransaction = await TransactionModel.findById(transactionId);
        if (!existingTransaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Delete the transaction
        await TransactionModel.findByIdAndDelete(transactionId);

        res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/month/:id', async (req, res) => {
  try {
      const transactionId = req.params.id;

      // Check if the transaction with the given ID exists
      const existingTransaction = await MonthModel.findById(transactionId);
      if (!existingTransaction) {
          return res.status(404).json({ error: 'Transaction not found' });
      }

      // Delete the transaction
      await MonthModel.findByIdAndDelete(transactionId);

      res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

  

app.get('/',(req,res)=>{
    res.send("working Fine")
})

app.listen(4000,()=>{
    console.log("Server Running")
})