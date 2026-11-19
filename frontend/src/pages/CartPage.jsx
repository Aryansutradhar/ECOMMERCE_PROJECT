
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

function CartPage() {
    const {
        cartItems,
        total,
        removeFromCart,
        updateQuantity,
    } = useCart();

    const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;

    return (
        <div className="pt-20 min-h-screen bg-gray-100 p-8">

            <h1 className="text-3xl font-bold mb-6 text-center">
                🛒 Shopping Cart
            </h1>

            {cartItems.length === 0 ? (
                <p className="text-center text-gray-600">
                    Your cart is empty.
                </p>
            ) : (
                <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">

                    {cartItems.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between gap-6 mb-4 border-b pb-4"
                        >

                            {/* Product Image */}
                            <div>
                                {item.product_image ? (
                                    <img
                                        src={
                                            item.product_image.startsWith("http")
                                                ? item.product_image
                                                : `${BASEURL}${item.product_image}`
                                        }
                                        alt={item.product_name}
                                        className="w-20 h-20 object-cover rounded"
                                    />
                                ) : (
                                    <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                                        No Image
                                    </div>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className="flex-1">
                                <h2 className="text-lg font-semibold">
                                    {item.product_name}
                                </h2>

                                <p className="text-gray-600">
                                    $
                                    {Number(
                                        item.product_price || 0
                                    ).toFixed(2)}
                                </p>
                            </div>

                            {/* Quantity */}
                            <div className="flex items-center gap-3">

                                <button
                                    onClick={() =>
                                        updateQuantity(
                                            item.id,
                                            item.quantity - 1
                                        )
                                    }
                                    disabled={item.quantity <= 1}
                                    className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded disabled:opacity-50"
                                >
                                    -
                                </button>

                                <span className="font-semibold">
                                    {item.quantity}
                                </span>

                                <button
                                    onClick={() =>
                                        updateQuantity(
                                            item.id,
                                            item.quantity + 1
                                        )
                                    }
                                    className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded"
                                >
                                    +
                                </button>

                                <button
                                    onClick={() =>
                                        removeFromCart(item.id)
                                    }
                                    className="text-red-500 hover:text-red-700 ml-2"
                                >
                                    Remove
                                </button>

                            </div>
                        </div>
                    ))}

                    {/* Total */}
                    <div className="border-t pt-4 mt-4 flex justify-between">
                        <h2 className="text-xl font-bold">
                            Total:
                        </h2>

                        <p className="text-xl font-semibold">
                            ${Number(total || 0).toFixed(2)}
                        </p>
                        <Link to="/checkout" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300">
                        Proceed to Checkout
                        </Link>
                    </div>

                </div>
            )}
        </div>
    );
}

export default CartPage;
