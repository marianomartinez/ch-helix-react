import React, { useState } from 'react';
import { useCartContext } from '../context/CartContext';
import UserForm from './UserForm';
import { Link } from 'react-router-dom';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { getFirestore } from '../firebase';

const Cart = () => {

  // --- BUYER---
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userEmailConfirm, setUserEmailConfirm] = useState('');

  function onUserNameChanged(evt) { setUserName(evt.target.value); };
  function onUserPhoneChanged(evt) { setUserPhone(evt.target.value); };
  function onUserEmailChanged(evt) { setUserEmail(evt.target.value); };
  function onUserEmailConfirmChanged(evt) { setUserEmailConfirm(evt.target.value); };

  // --- CART ---
  // Calculate total price of cart contents 
  const { cart, removeFromCart, clearCart } = useCartContext();
  let cartTotal = 0;
  if (cart === null) {
    return cartTotal;
  } else {
    let eachItemTotal = 0;
    eachItemTotal = cart.map(item => item.price * item.qtyInCart);
    cartTotal = eachItemTotal.reduce((total, num) => total + num, 0);
  };

  // --- ORDER ---
  async function createOrder() {
    // Create new order form
    const newOrder = {
      buyer: { userName, userPhone, userEmail },
      items: cart.map(i => ({ id: i.id, title: i.title, quantity: i.qtyInCart, price: i.price })),
      date: firebase.firestore.FieldValue.serverTimestamp(),
      total: cartTotal,
      status: "completed"
    };
    // Define functions to Add order to "orders" collection
    const db = getFirestore();
    const orders = db.collection("orders");
    try {
      // Exectute order addition to "orders"
      const doc = await orders.add(newOrder);
      // Returns a success message with the order ID
      const orderId = doc.id;
      alert(`Order created with id: ${orderId}`);
      // Defines functions to Update item's stock
      const itemsToUpdate = db.collection("items").where(firebase.firestore.FieldPath.documentId(), 'in', cart.map(i => i.id));
      const query = await itemsToUpdate.get();
      const batch = db.batch();
      const notEnoughStock = [];
      query.docs.forEach((docSnapshot, idx) => {
        if (docSnapshot.data().stock >= cart[idx].qtyInCart) {
          batch.update(docSnapshot.ref, { stock: docSnapshot.data().stock - cart[idx].qtyInCart });
        } else {
          notEnoughStock.push({ ...docSnapshot.data(), id: docSnapshot.id });
        }
      });
      // Execution of Update items' stock
      if (notEnoughStock.length === 0) {
        await batch.commit();
      };
      clearCart([]);
    } catch (err) {
      console.log('!!!Error creating order: ', err);
    }
  };

  return (
    <div className="container bg-dark mt-5">
      <div className="container d-flex flex-wrap">
        {cart.length > 0 ?
          <>
            <h3 className="col-12 text-center">Your cart contents</h3>
            <ul className="col-12 list-unstyled">
              {cart.map(cartItem => (
                <div className="col-12 bg-secondary py-2 mb-1 rounded d-flex flex-no-wrap">
                  <figure className="col-1 my-auto">
                    <img className="w-100 rounded" src={cartItem.imageURL} alt="distortion" />
                  </figure>
                  <div className="col-7 pl-2 my-auto rounded">
                    <p className="my-1">Model: {cartItem.title}</p>
                    <p className="my-1">Based on: {cartItem.realName}</p>
                  </div>
                  <div className="col-2 my-auto">
                    <p className="my-1 text-center">${cartItem.price} x {cartItem.qtyInCart}</p>
                  </div>
                  <div className="col-1 my-auto">
                    <p className="my-1 text-center">${cartItem.price * cartItem.qtyInCart}</p>
                  </div>
                  <button onClick={() => removeFromCart(cartItem.id)} className="col-1 btn btn-secondary rounded shadow-none ml-1">Remove</button>
                </div>
              ))}
              <div className="col-12 bg-secondary py-2 mb-1 rounded d-flex justify-content-end">
                <p className="my-auto">Total: ${cartTotal}</p>
              </div>
            </ul>
            <button onClick={() => clearCart([])} className="btn btn-secondary rounded shadow-none mx-auto">Clear Cart</button>
            <UserForm userNameChange={onUserNameChanged} userPhoneChange={onUserPhoneChanged} userEmailChange={onUserEmailChanged} userEmailConfirmChange={onUserEmailConfirmChanged} />
            {userName && userPhone && userEmail && userEmail === userEmailConfirm &&
              <button onClick={createOrder} className="btn btn-secondary rounded shadow-none mx-auto">Checkout</button>}
          </>
          :
          <>
            <h3 className="col-12 text-center">Your cart is empty</h3>
            <Link className="col-12 text-center" to="/">
              <button className="btn btn-secondary rounded shadow-none mx-auto">Browse items</button>
            </Link>
          </>}
      </div>
    </div>
  )
};

export default Cart;