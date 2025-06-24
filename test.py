import requests

url = "https://dea9sdklfb.execute-api.us-east-1.amazonaws.com/api/polls/d23b1d56-b376-4efe-a73a-c36acfb8bb3d"

payload = {
    "optionID": "3cf89b56-2ea6-4e0e-9bc3-d28fb0b6a5d7",
    "optionName": "Colorado - The Container Ranch",
    "userName": None,
    "botTrapValue": None,
    "captchaText": "CPXd2R",
    "ja3Fingerprint": "7ec30082cc319511d8dbe2cf04738a84",
    "ja4Fingerprint": "t13d1517h2_8daaf6152771_b6f405a00624",
    "userFingerprint": "cfb5ddb6617c57bcb02629412fb3917c"
}

headers = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (compatible; Python script)"
}

response = requests.post(url, json=payload, headers=headers)

print("Status Code:", response.status_code)
print("Response Body:", response.text)
