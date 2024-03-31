const express = require("express")
const route = express.Router();

const ordermodel = require("../database/orderschema");


const stripe = require('stripe')('sk_test_51Out25SCexRHalt0T5AZA8GsUEeZvneJGrwEXZlIhyXkhGZ1GFnuPKtcR7BRtNuoOQ6nDvsrGWhASZBBhzpyAyqI00ObAjZDfA');



const endpointSecret = "whsec_08c98d166ff748a4ef94f83b2a4754e7e48aeaacc54bb7c74043a84f2ce64ba3";
route.post('/webhook', express.raw({type: 'application/json'}), async(request, response) => {
  const sig = request.headers['stripe-signature'];

  

  let event;
  console.log("webhook")
  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    // console.log(event);
  } catch (error) {
    console.log("error"+error.message)
    response.status(400).send(`Webhook Error: ${error.message}`);
    return;
  }
  

  const paymentids = event.data.object.id
      console.log(event.type);

   
  // Handle the event
  switch (event.type) {
    case 'payment_intent.amount_capturable_updated':
      const paymentIntentAmountCapturableUpdated = event.data.object;
      // Then define and call a function to handle the event payment_intent.amount_capturable_updated
      break;
    case 'payment_intent.canceled':
      const paymentIntentCanceled = event.data.object;
      // Then define and call a function to handle the event payment_intent.canceled
      break;
    case 'payment_intent.created':
      const paymentIntentCreated = event.data.object;
      // Then define and call a function to handle the event payment_intent.created
      break;
    case 'payment_intent.partially_funded':
      const paymentIntentPartiallyFunded = event.data.object;
      // Then define and call a function to handle the event payment_intent.partially_funded
      break;
    case 'payment_intent.payment_failed':
      const paymentIntentPaymentFailed = event.data.object;
      // Then define and call a function to handle the event payment_intent.payment_failed
      break;
    case 'payment_intent.processing':
      const paymentIntentProcessing = event.data.object;
      // Then define and call a function to handle the event payment_intent.processing
      break;
    case 'payment_intent.requires_action':
      const paymentIntentRequiresAction = event.data.object;
      // Then define and call a function to handle the event payment_intent.requires_action
      break;
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      // Then define and call a function to handle the event payment_intent.succeeded
      console.log("successfull")
      
     
      break;
      case 'checkout.session.completed':
        console.log("completed")
       
        const paymentids = event.data.object.id
      console.log("paymrntidfinal"+paymentids);
    
      const updating = await ordermodel.findOneAndUpdate(
        { paymentid: paymentids },
        { paymentstatus: "Successfull" },
        { new: true } // To return the updated document
      );
    
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

module.exports = route;
