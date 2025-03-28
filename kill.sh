#!/bin/bash
lsof -t -i :3000 | xargs kill -9