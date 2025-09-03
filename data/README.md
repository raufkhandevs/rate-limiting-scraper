# Proxy Data

This directory contains proxy data for the rate-limiting scraper application.

## Getting Proxy List

To update the proxy list:

1. Visit [https://free-proxy-list.net/en/](https://free-proxy-list.net/en/)
2. Scroll down to the "Free Proxy List" table
3. Click the document icon (📄) above the table to download the raw list
4. Copy the proxy data from the downloaded file
5. Paste it into `proxies.txt` in this directory
6. **Important**: Remove any extra text, headers, or formatting - the file should only contain proxy entries in the format `ip:port`

## File Format

The `proxies.txt` file should contain one proxy per line in the format:

```
ip:port
```

### Example:

```
65.108.251.40:53535
123.141.181.24:5031
47.252.29.28:11222
67.43.236.21:4653
```

## Notes

- The proxy list is updated every 10 minutes on free-proxy-list.net
- Only include valid `ip:port` entries
- Comments (lines starting with `#`) are supported and will be ignored
- Empty lines are ignored
- The application will automatically detect HTTP/HTTPS protocol based on port 443

## Usage

The proxy parser utility (`src/utils/proxy-parser.ts`) will automatically:

- Parse the proxy list from this file
- Validate IP addresses and port numbers
- Filter out invalid entries
- Determine protocol (HTTP/HTTPS) based on port
