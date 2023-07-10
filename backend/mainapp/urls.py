from django.urls import path
from . import views
from django.views.generic import TemplateView


urlpatterns = [
    path('', TemplateView.as_view(template_name='index.html')),
    path('api/brain-surface/', views.get_brain_surface_data, name='get_brain_surface_data'),
    path('api/region-detail/', views.get_region_detail_data, name='get_region_detail_data'),
    path('api/global-indicator-name/', views.get_global_indicator_name, name='get_global_indicator_name'),
    path('api/global-benchmark/', views.get_global_benchmark_data, name='get_global_benchmark_data'),
    path('api/search-neo4j/', views.search_neo4j, name='search_neo4j'),
]