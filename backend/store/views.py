
from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer
from rest_framework import status
from .models import Product, Category, Cart, CartItem, Order, OrderItem
from .serializers import (
    ProductSerializer,
    CategorySerializer,
    CartSerializer,
    CartItemSerializer,
)


# =========================
# Products
# =========================

@api_view(["GET"])
def get_products(request):
    products = Product.objects.all()

    serializer = ProductSerializer(
        products,
        many=True,
        context={"request": request}
    )

    return Response(serializer.data)


@api_view(["GET"])
def get_product(request, pk):
    try:
        product = Product.objects.get(id=pk)

        serializer = ProductSerializer(
            product,
            context={"request": request}
        )

        return Response(serializer.data)

    except Product.DoesNotExist:
        return Response(
            {"error": "Product not found"},
            status=404
        )


# =========================
# Categories
# =========================

@api_view(["GET"])
def get_categories(request):
    categories = Category.objects.all()

    serializer = CategorySerializer(
        categories,
        many=True
    )

    return Response(serializer.data)


# =========================
# Cart
# =========================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_cart(request):
    cart, created = Cart.objects.get_or_create(user=request.user)

    serializer = CartSerializer(
        cart,
        context={"request": request}
    )

    return Response(serializer.data)


# =========================
# Add To Cart
# =========================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    product_id = request.data.get("product_id")

    if not product_id:
        return Response(
            {"error": "product_id is required"},
            status=400
        )

    try:
        product = Product.objects.get(id=product_id)

    except Product.DoesNotExist:
        return Response(
            {"error": "Product not found"},
            status=404
        )

    # Get the guest cart
    cart, created = Cart.objects.get_or_create(user=request.user)

    # Get existing product or create new item
    item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={"quantity": 1}
    )

    # IMPORTANT:
    # If product already exists, increase quantity
    if not created:
        item.quantity += 1
        item.save(update_fields=["quantity"])

    serializer = CartSerializer(
        cart,
        context={"request": request}
    )

    return Response({
        "message": "Product added to cart",
        "quantity": item.quantity,
        "cart": serializer.data
    })


# =========================
# Update Quantity
# =========================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_cart_quantity(request):
    item_id = request.data.get("item_id")
    quantity = request.data.get("quantity")

    if not item_id or quantity is None:
        return Response(
            {"error": "item_id and quantity are required"},
            status=400
        )

    try:
        item = CartItem.objects.get(id=item_id)

    except CartItem.DoesNotExist:
        return Response(
            {"error": "Cart item not found"},
            status=404
        )

    try:
        quantity = int(quantity)

    except (TypeError, ValueError):
        return Response(
            {"error": "Quantity must be a number"},
            status=400
        )

    if quantity < 1:
        item.delete()

        return Response({
            "message": "Item removed from cart"
        })

    item.quantity = quantity
    item.save(update_fields=["quantity"])

    serializer = CartItemSerializer(
        item,
        context={"request": request}
    )

    return Response({
        "message": "Quantity updated",
        "item": serializer.data
    })


# =========================
# Remove From Cart
# =========================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def remove_from_cart(request):
    item_id = request.data.get("item_id")

    if not item_id:
        return Response(
            {"error": "item_id is required"},
            status=400
        )

    deleted, _ = CartItem.objects.filter(id=item_id).delete()

    if deleted == 0:
        return Response(
            {"error": "Cart item not found"},
            status=404
        )

    return Response({
        "message": "Item removed from cart"
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_order(request):
    try:
        data = request.data
        name =data.get('name')
        address = data.get('address')
        phone = data.get('phone')
        payment_method = data.get('payment_method','COD')

        #Vlidate Phone number
        if not phone.isdigit() or len(phone) <10:
            return Response({'error':'Invalid phone number'},status=400)

        # Get user's cart
        cart , created = Cart.objects.get_or_create(user=request.user)
        if not cart.items.exists():
            return Response({'error':'Cart is empty'},status=400)

        total =sum([item.product.price * item.quantity for item in cart.items.all()])

        order = Order.objects.create(user=request.user, total_price=total)

        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )
        # Clear the cart
        cart.items.all().delete()
        return Response({'message':'Order created successfully', 'order_id':order.id})
    except Exception as e:
        return Response({'error':str(e)},status=500)



@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({"messgae":"User Created Successfully","user":UserSerializer(user).data},status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
