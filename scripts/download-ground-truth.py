#!/usr/bin/env python3

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import json
import sys

output_filename = sys.argv[1]

cred = credentials.Certificate("marauder-129-firebase-adminsdk-1aa9h-0f76359e06.json")
firebase_admin.initialize_app(cred)

total_records = 0
ground_truth_records = []

for doc in firestore.client().collection('updates').get():
    total_records += 1
    data = doc.to_dict()
    if 'tileLocation' in data:
        ground_truth_records.append({
            'phoneLocation': data['phoneLocation'],
            'tileLocation': data['tileLocation'],
            'rssiMeasurement': data['rssiMeasurement'],
            'timestamp': data['timestamp'],
        })

with open(output_filename, 'w') as f:
    f.write(json.dumps(ground_truth_records, indent=2, sort_keys=True, default=str))

skipped = total_records - len(ground_truth_records)
print('wrote {} records (skipped {})'.format(len(ground_truth_records), skipped))
