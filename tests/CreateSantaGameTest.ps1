function new-santagametest {
    [CmdletBinding()]
    Param(
        $apipath = "http://localhost:5000"
    )
    $DefParams = @{
        UseBasicParsing = $true
        'ContentType' = 'application/json'
    }
    # new
    $game = Invoke-RestMethod "$apipath/new" @DefParams -Method POST -Body $(@{name="Test Game $(Get-Random)"} |ConvertTo-Json)
    $game

    # test users
    $names = 1..3 | ForEach-Object { "Test User $_" }
    $names | ForEach-Object {
        $JsonParams = @{'name' = $_; 'code' = $game.pubkey } | ConvertTo-Json
        Invoke-RestMethod @DefParams -Method POST -uri "$apipath/user" -Body $JsonParams
    }

    # ideas
    1..7 | ForEach-Object{
        $JsonParams = @{ idea = "Test idea $_"; code = $game.pubkey } | ConvertTo-Json
        Invoke-RestMethod @DefParams -Method POST -uri "$apipath/idea" -Body $JsonParams
    }

    # run game
    Invoke-RestMethod @DefParams -Method POST -uri "$apipath/game" -Body $(
        @{ code = $game.pubkey; secret = $game.privkey; state=1} | ConvertTo-Json
    )

    #get results
    $names | ForEach-Object{
        Invoke-RestMethod @DefParams -Method GET -Uri "http://localhost:5000/user?code=$($game.pubkey)&name=$($_)"
    }
}