import React from 'react';
import { useCartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';

function CartWidget() {
    const { cart } = useCartContext();
    let quantities = cart.map(item => item.qtyInCart);
    let cartQty = quantities.reduce((total, num) => total + num, 0);

    return (
        <Link to="/cart" className="text-decoration-none">
            <button className="btn btn-secondary d-flex">
                <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-cart" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                </svg>
                <span className="">{cartQty > 0 ? cartQty : null}</span>
            </button>
        </Link>
    )
}

export default CartWidget;