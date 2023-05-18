from django.urls import path
from . import views


urlpatterns = [
    path('api/brain-surface/', views.get_brain_surface_data, name='get_brain_surface_data'),
]