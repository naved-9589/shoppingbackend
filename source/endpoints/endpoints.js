const express = require("express")
const route = express.Router();
require('dotenv').config()
const usermodel = require("../database/userschema");
const productmodel = require("../database/productschema");
const jwt = require('jsonwebtoken');
const path = require("path")
const auth = require("../authentication/auth");
const cartmodel = require("../database/cartschema");
const ordermodel = require("../database/orderschema");


const stripe = require('stripe')('sk_test_51Out25SCexRHalt0T5AZA8GsUEeZvneJGrwEXZlIhyXkhGZ1GFnuPKtcR7BRtNuoOQ6nDvsrGWhASZBBhzpyAyqI00ObAjZDfA');


// stripe payment


const YOUR_DOMAIN = 'http://localhost:5173';

route.post('/create-checkout-session', auth, async (req, res) => {

 try {
  
  const items = req.body.items;

  // Calculate total price of all items
  let totalPrice = 0;
  for (const item of items) {
    totalPrice += item.regularprice * item.quantity;
  }
  const product = await stripe.products.create({
    name: req.body.items[0].name, // Replace with your actual product name
  });

  const price = await stripe.prices.create({
    unit_amount: totalPrice,
    currency: 'usd', // Specify the currency (change this according to your requirements)
    product: product.id,
  });


  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    payment_method_types: ['card'],
    line_items: req.body.items.map((item) => {
      return {

        price: price.id,
        quantity: item.quantity
      }
    }),
    mode: 'payment',

    // billing_address_collection: 'required', // Collect billing address
    shipping_address_collection: {
      allowed_countries: ['US'] // Allow only India for shipping address
    },

    return_url: `${YOUR_DOMAIN}/return?session_id={CHECKOUT_SESSION_ID}`,
  });

  const productItems = req.body.items.map(item => ({
    id: item.productId, // Assuming productId is present in the item object
    quantity: item.quantity
  }));

  console.log(productItems);

  const inserting = new ordermodel({
    userid: req.user._id,
    paymentid: session.id,
    paymentstatus: "Panding",
    products: productItems,
    name: "",
    email: "",
    price: totalPrice,
    address: {
      line1: "",
      city: "",
      postal_code: "",
      state: "",
      country: ""
    }
  })

  const data = await inserting.save();

  res.send({ clientSecret: session.client_secret });
  // console.log(session)

 } catch (error) {
  console.log(error);
 }

})

route.get('/session-status', async (req, res) => {
  try {
    
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    // console.log(session);
  
  
    const updating = await ordermodel.findOneAndUpdate(
      { paymentid: session.id },
      {
        $set: {
          name: session.customer_details.name,
          email: session.customer_details.email,
          address: {
            line1: session.customer_details.address.line1,
            city: session.customer_details.address.city,
            postal_code: session.customer_details.address.postal_code,
            state: session.customer_details.address.state,
            country: session.customer_details.address.country
          }
          
        }
      },
      { new: true } // To return the updated document
    );
  
    res.send({
      status: session.status,
      customer_email: session.customer_details.email
    });

  } catch (error) {
    console.log(error);
  }

});


// const endpointSecret = "whsec_08c98d166ff748a4ef94f83b2a4754e7e48aeaacc54bb7c74043a84f2ce64ba3";
// route.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
//   const sig = request.headers['stripe-signature'];

//   let event;
//   console.log("webhook")
//   try {
//     event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
//     console.log("type"+event.type);
//   } catch (error) {
//     console.log("error"+error.message)
//     response.status(400).send(`Webhook Error: ${error.message}`);
//     return;
//   }
 
//    console.log(event);

//   // Handle the event
//   switch (event.type) {
//     case 'payment_intent.amount_capturable_updated':
//       const paymentIntentAmountCapturableUpdated = event.data.object;
//       // Then define and call a function to handle the event payment_intent.amount_capturable_updated
//       break;
//     case 'payment_intent.canceled':
//       const paymentIntentCanceled = event.data.object;
//       // Then define and call a function to handle the event payment_intent.canceled
//       break;
//     case 'payment_intent.created':
//       const paymentIntentCreated = event.data.object;
//       // Then define and call a function to handle the event payment_intent.created
//       break;
//     case 'payment_intent.partially_funded':
//       const paymentIntentPartiallyFunded = event.data.object;
//       // Then define and call a function to handle the event payment_intent.partially_funded
//       break;
//     case 'payment_intent.payment_failed':
//       const paymentIntentPaymentFailed = event.data.object;
//       // Then define and call a function to handle the event payment_intent.payment_failed
//       break;
//     case 'payment_intent.processing':
//       const paymentIntentProcessing = event.data.object;
//       // Then define and call a function to handle the event payment_intent.processing
//       break;
//     case 'payment_intent.requires_action':
//       const paymentIntentRequiresAction = event.data.object;
//       // Then define and call a function to handle the event payment_intent.requires_action
//       break;
//     case 'payment_intent.succeeded':
//       const paymentIntentSucceeded = event.data.object;
//       // Then define and call a function to handle the event payment_intent.succeeded
//       console.log("successfull")

//       break;
//     // ... handle other event types
//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   // Return a 200 response to acknowledge receipt of the event
//   response.send();
// });


// route.post('/create-checkout-session',auth, async (req, res) => {


// const stripeCustomer = await stripe.customers.create({
//   name: "test",
//   address: {
//     line1: "test",
//     city: "test",
//     postal_code: "test",
//     state: "test",
//     country: 'IN' // Assuming customer is located in India
//   }
// });

//   const session = await stripe.checkout.sessions.create({
//     line_items: req.body.items.map((item)=>{
//        return{
//         price_data:{
//           currency: "inr",
//           product_data:{
//             name: item.name
//           },
//           unit_amount: (item.regularprice)*100,
//         },
//         quantity: item.quantity
//        }
//     }),
//     mode: 'payment',
//     success_url: `${YOUR_DOMAIN}?success`,
//     cancel_url: `${YOUR_DOMAIN}?canceled`,

//     billing_address_collection: 'required', // Collect billing address
//     shipping_address_collection: {
//       allowed_countries: ['IN'] // Allow only India for shipping address
//     },
//   });
//    console.log(session)
//   res.json({url: session.url});
// });



//              testing route
route.get("/", async (req, res) => {
  try {
    console.log("hello")
    res.json("hello")
  } catch (error) {
    res.json(error);
    console.log(error)
  }
})



//          register user

route.post("/register", async (req, res) => {
  try {
    console.log(req.body)
    const check = await usermodel.findOne({ email: req.body.email })

    if (check) {
      return res.json("this email is already exists");
    }

    if (req.body.password !== req.body.cpassword) {
      return res.json("password and conform password not match");
    }

    const inserting = new usermodel({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      cpassword: req.body.cpassword,

    })

    const data = await inserting.save();
    //   const authtoke = jwt.sign({token : inserting._id}, process.env.JWT_SECRET, {expiresIn: '1h'})
    //   console.log("token.... "+authtoke)

    res.json("successfull");

  } catch (error) {
    console.log(error);
  }
})

//                         login user

route.post("/login", async (req, res) => {
  try {
    // console.log(req.body)
    const finding = await usermodel.findOne({ email: req.body.email });

    if (!finding) {
      return res.json("no user exists at this credentials")
    }

    if (finding.password !== req.body.password) {
      return res.json("incorrect values");
    }



    if (req.body.cartitemsonlocal !== null) {





      const cartItemsToAdd = req.body.cartitemsonlocal;





      // Iterate over each cart item to add/update it in the user's cart
      for (const cartItem of cartItemsToAdd) {
        // Find all cart items in the user's cart with the same productId
        const existingCartItems = await cartmodel.find({
          userid: finding._id,
          productid: cartItem._id
        });



        if (existingCartItems.length > 0) {
          // If there are existing cart items for the product, update their quantities
          for (const existingCartItem of existingCartItems) {
            existingCartItem.quantity += cartItem.quantity;
            await existingCartItem.save();
          }
        } else {
          // If the product does not exist in the cart, add it with the user ID


        }
      }

      const itemsforsort = [];
      for (const cartItem of cartItemsToAdd) {
        // Find all cart items in the user's cart with the same productId
        const existingCartItems = await cartmodel.findOne({
          userid: finding._id,
          productid: cartItem._id
        });
        if (existingCartItems !== null) {
          itemsforsort.push(existingCartItems);
        }


      }

      const filteredArray = cartItemsToAdd.filter(objFromA =>
        !itemsforsort.find(objFromB => objFromA._id === objFromB.productid)
      );
      if (filteredArray) {
        console.log(filteredArray);
        const cartItemsWithUserId = filteredArray.map(item => ({

          userid: finding._id, // Add the user ID to each cart item
          productid: item._id,
          name: item.name,
          image: item.image,
          regularprice: item.regularprice,
          quantity: item.quantity,
          saleprice: item.saleprice,


        }));


        const result = await cartmodel.insertMany(cartItemsWithUserId);
        console.log('Cart items inserted successfully:', result);

      }


    }





    const authtoke = jwt.sign({ token: finding._id }, process.env.JWT_SECRET, { expiresIn: '1h' })
    const cartitems = await cartmodel.find({ userid: finding._id });
    res.json({ token: authtoke, cart: cartitems });

  } catch (error) {
    console.log(error);
  }
})


//   updateproduct

route.get("/updateproduct", async (req, res) => {
  try {

    const updating = await productmodel.findOneAndUpdate({ _id: "65e9f457d5b00b9f7e3a8ee8" }, { saleprice: 4 });
    console.log(updating);
    res.json(updating);
  } catch (error) {
    console.log(error);
  }
})


//              addproduct


route.post("/addproduct", async (req, res) => {
  try {

    console.log(req.files)
    const filename = Date.now() + "_" + req.files.image.name;
    const file = req.files.image;

    let uploaddirectory = path.join(__dirname + "/../uploads");

    const uploadpath = uploaddirectory + "/" + filename;


    file.mv(uploadpath, async (error) => {
      if (error) {
        return res.json(error);
      }


    })

    const inserting = new productmodel({
      name: req.body.name,
      image: filename,
      regularprice: req.body.regularprice,
      saleprice: req.body.saleprice,
      status: req.body.status
    })

    const data = await inserting.save();
    res.send(data)

  } catch (error) {
    console.log(error);
  }
})

//               get upcoming products for home 

route.get("/upcomingproduct", async (req, res) => {
  try {
    console.log("htttt")
    const finding = await productmodel.find({ status: "upcoming" });

    res.json(finding);

  } catch (error) {

    console.log(error);
  }
})

//                     get all products for product

route.get("/fetchproducts", async (req, res) => {
  try {

    const finding = await productmodel.find({ status: "launched" });
    res.json(finding);

  } catch (error) {
    console.log(error);
  }
})

//                    addcart 

route.post("/addcart", auth, async (req, res) => {
  try {


    const finding = usermodel.findOne({ id: req.user });
    if (!finding) {
      return res.json("not found");
    }

    const cartitem = await cartmodel.findOne({ productid: req.body.productid, userid: req.user._id })
    console.log(cartitem)
    if (cartitem) {

      // Find the existing cart item in the user's cart by productId
      const existingCartItem = await cartmodel.findOneAndUpdate(
        {
          userid: cartitem.userid,
          productId: cartitem.productId
        },
        {
          $inc: { quantity: +1 } // Increment quantity by cart item's quantity
        },
        {
          new: true // Return the modified document
        }
      );

      const finditems = await cartmodel.find({ userid: req.user._id });
      return res.json(finditems)
    }

    const inserting = new cartmodel({
      productid: req.body.productid,
      userid: req.user._id,
      name: req.body.name,
      image: req.body.image,
      regularprice: req.body.regularprice,
      saleprice: req.body.saleprice,
      quantity: req.body.quantity
    })
    const data = await inserting.save();

    const finditems = await cartmodel.find({ userid: req.user._id });
    console.log(finditems)
    res.json(finditems)


  } catch (error) {
    console.log(error);
  }
})


//         delete cart

route.delete("/deletecart", auth, async (req, res) => {
  try {

    const deleting = await cartmodel.findOneAndDelete({ _id: req.body.id })
    const findcart = await cartmodel.find({ userid: req.user._id })
    res.json(findcart);
  } catch (error) {
    console.log(error);
  }
})

//  fetch cart 


route.get("/fetchcart", auth, async (req, res) => {
  try {

    const finding = await cartmodel.find({ userid: req.user._id });
    res.json(finding);

  } catch (error) {
    console.log(error);
  }
})

module.exports = route;