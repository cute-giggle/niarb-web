import os
import numpy as np
import matplotlib.pyplot as plt
import json

from django.shortcuts import render
from django.http import JsonResponse

from .search_neo4j import precise_search_simple


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
    

def get_global_indicator_name(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'GET request required.'})
    type = request.GET.get('type')
    if type not in ['structural', 'functional']:
        return JsonResponse({'error': 'type must be structural or functional'})
    data_path = os.path.join(os.path.dirname(__file__), f'../static/brain-benchmark/{type}/global_indicator_name.json')
    return JsonResponse(json.load(open(data_path)), safe=False)


functional_global_benchmark = json.load(open(os.path.join(os.path.dirname(__file__), f'../static/brain-benchmark/functional/global_benchmark.json')))
structural_global_benchmark = json.load(open(os.path.join(os.path.dirname(__file__), f'../static/brain-benchmark/structural/global_benchmark.json')))


def get_global_benchmark_data(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'GET request required.'})
    type = request.GET.get('type')
    if type not in ['structural', 'functional']:
        return JsonResponse({'error': 'type must be structural or functional'})
    data = structural_global_benchmark if type == 'structural' else functional_global_benchmark
    name = request.GET.get('name')
    if name not in data:
        return JsonResponse({'error': 'name not found'})
    histgram = np.histogram(data[name], bins=int(np.sqrt(len(data[name]))))
    return JsonResponse({'hist': np.around(histgram[0], 2).tolist(), 'bins': np.around(histgram[1][0: -1], 2).tolist()})


shaefer_region_detail = json.load(open(os.path.join(os.path.dirname(__file__), f'../static/brain-knowledge/shaefer-400-7_region_detail.json')))
aparc_region_detail = json.load(open(os.path.join(os.path.dirname(__file__), f'../static/brain-knowledge/aparc_region_detail.json')))
brodmann_region_detail = json.load(open(os.path.join(os.path.dirname(__file__), f'../static/brain-knowledge/brodmann_region_detail.json')))


def get_region_detail_data(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'GET request required.'})
    type = request.GET.get('type')
    if type not in ['shaefer-400-7', 'aparc', 'brodmann']:
        return JsonResponse({'error': 'type must be shaefer-400-7 or aparc or brodmann'})
    data = shaefer_region_detail if type == 'shaefer-400-7' else (aparc_region_detail if type == 'aparc' else brodmann_region_detail)
    name = request.GET.get('name')
    if name not in data:
        return JsonResponse({'error': 'name not found'})
    return JsonResponse(data[name])


def search_neo4j(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'GET request required.'})
    type = request.GET.get('type')
    if type not in ['precise']:
        return JsonResponse({'error': 'type must be precise'})
    name = request.GET.get('name')
    if name is None:
        return JsonResponse({'error': 'name must be given'})
    result = precise_search_simple(name)
    if result is None:
        return JsonResponse({'error': 'no result'})
    return JsonResponse(result)
    