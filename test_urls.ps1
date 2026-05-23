$urls = @(
    "https://kafana-gore-kahvalti.carveldigital.com/storage/products/69d1a5fa0f568.webp",
    "https://kafana-gore-kahvalti.carveldigital.com/storage/products/69d2e30ab10b0.webp",
    "https://kafana-gore-kahvalti.carveldigital.com/storage/products/69d603f1df22a.webp",
    "https://cdn.carveldigital.com/storage/products/69e1c7d947258.webp",
    "https://kafana-gore-kahvalti.carveldigital.com/storage/products/69d5cc46d8d6e.webp",
    "https://kafana-gore-kahvalti.carveldigital.com/storage/products/69d5cc7f71e3b.webp",
    "https://kafana-gore-kahvalti.carveldigital.com/storage/products/69d5cc930f0b1.webp",
    "https://kafana-gore-kahvalti.carveldigital.com/storage/products/69d5ccaf6cad3.webp",
    "https://kafana-gore-kahvalti.carveldigital.com/storage/products/69d5ccbf3ebb8.webp",
    "https://kafana-gore-kahvalti.carveldigital.com/storage/products/69d5cc8993411.webp",
    "https://kafana-gore-kahvalti.carveldigital.com/storage/products/69d5cca03cc18.webp",
    "https://kafana-gore-kahvalti.carveldigital.com/storage/products/69d5ccf0e1cfd.webp",
    "https://kafana-gore-kahvalti.carveldigital.com/storage/products/69d5ccfae2aa9.webp",
    "https://kafana-gore-kahvalti.carveldigital.com/storage/products/69d5cd6c9ea96.webp",
    "https://kafana-gore-kahvalti.carveldigital.com/storage/products/69d616b7280b3.webp",
    "https://kafana-gore-kahvalti.carveldigital.com/storage/products/69d626a819b2b.webp",
    "https://kafana-gore-kahvalti.carveldigital.com/storage/products/69dcbe76f0299.webp",
    "https://kafana-gore-kahvalti.carveldigital.com/storage/products/69d2e454e5048.webp",
    "https://kafana-gore-kahvalti.carveldigital.com/storage/products/69d2e461acf9e.webp",
    "https://kafana-gore-kahvalti.carveldigital.com/storage/products/4WzUGjRiC270dn5zbi0i1JTXD4ITgSOsghJfP1N4.webp",
    "https://kafana-gore-kahvalti.carveldigital.com/storage/products/adeQw9V60X67ZlLzv04F7ZWwBgEpjBrAzgpxEdJe.webp",
    "https://kafana-gore-kahvalti.carveldigital.com/storage/products/UFf7kgQgxKzeXH0HcMXA40m4fI2bOM45qOERku0A.webp",
    "https://kafana-gore-kahvalti.carveldigital.com/storage/products/69d2e4214ce2e.webp",
    "https://kafana-gore-kahvalti.carveldigital.com/storage/products/69d681f41ed97.webp",
    "https://kafana-gore-kahvalti.carveldigital.com/storage/products/69d2d9484001d.webp",
    "https://kafana-gore-kahvalti.carveldigital.com/storage/products/69d2d7fa8683f.webp",
    "https://cdn.carveldigital.com/storage/products/69e1c2814a120.webp",
    "https://kafana-gore-kahvalti.carveldigital.com/storage/products/69d64ff539c88.webp",
    "https://cdn.carveldigital.com/storage/products/6PxdMuQduGrRS2i7v9RKhZg3mM1TpdhyQXeo6Cfr.webp"
)

foreach ($url in $urls) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 5 -UseBasicParsing
        Write-Output "OK $($response.StatusCode) $url"
    } catch {
        Write-Output "FAIL $url"
    }
}
