from flask import Flask, request
from flask import render_template
from flask import current_app as app
import redis

@app.route("/")
def login():
    return render_template("index.html")