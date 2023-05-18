import os
import json

from django.shortcuts import render
from django.http import JsonResponse


def get_brain_surface_data(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'GET request required.'})
    type = request.GET.get('type')
    if type not in ['mesh', 'annotation']:
        return JsonResponse({'error': 'type must be mesh or annotation'})
    name = request.GET.get('name')
    if type == 'mesh':
        if name not in ['inflated', 'pial', 'white', 'orig']:
            return JsonResponse({'error': 'mesh name must be inflated, pial, white or orig'})
        data_path = os.path.join(os.path.dirname(__file__), f'../static/brain-surface/mesh/{name}.json')
        return JsonResponse(json.load(open(data_path)))
    else:
        if name not in ['aparc', 'brodmann', 'shaefer-400-7']:
            return JsonResponse({'error': 'annotation name must be aparc, brodmann or shaefer-400-7'})
        data_path = os.path.join(os.path.dirname(__file__), f'../static/brain-surface/annotation/{name}.json')
        return JsonResponse(json.load(open(data_path)))
    