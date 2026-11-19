
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

function ProductDetails() {
    const { id } = useParams();

    const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(
                    `${BASEURL}/api/products/${id}/`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch product details");
                }

                const data = await response.json();

                console.log("Product:", data);

                setProduct(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, BASEURL]);

    // Loading
    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <p className="text-xl">Loading...</p>
            </div>
        );
    }

    // Error
    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <p className="text-red-500">
                    Error: {error}
                </p>
            </div>
        );
    }

    // No product
    if (!product) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <p className="text-gray-600">
                    No product found
                </p>
            </div>
        );
    }

    const handelAddtoCart = () => {
    if (!localStorage.getItem("access_token")) {
        window.location.href = "/login";
        return;
    }

        addToCart(product);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center py-20 px-4">

            <div className="bg-white shadow-lg rounded-2xl p-8 max-w-3xl w-full">

                <div className="flex flex-col md:flex-row gap-8">

                    {/* Product Image */}
                    <div className="md:w-1/2">
                        <img
                            src={
                                product.image?.startsWith("http")
                                    ? product.image
                                    : `${BASEURL}${product.image}`
                            }
                            alt={product.name}
                            className="w-full h-auto object-cover rounded-lg"
                        />
                    </div>

                    {/* Product Information */}
                    <div className="flex-1">

                        <h1 className="text-3xl font-bold text-gray-800 mb-3">
                            {product.name}
                        </h1>

                        <p className="text-gray-600 mb-4">
                            {product.description}
                        </p>

                        <p className="text-2xl font-semibold text-green-600 mb-6">
                            ${Number(product.price).toFixed(2)}
                        </p>

                        {/* Add To Cart */}
                        <button
                            onClick={handelAddtoCart}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            Add to Cart 🛒
                        </button>

                        {/* Back To Home */}
                        <div className="mt-5">
                            <Link
                                to="/"
                                className="text-blue-600 hover:underline"
                            >
                                &larr; Back to Home
                            </Link>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

export default ProductDetails;
