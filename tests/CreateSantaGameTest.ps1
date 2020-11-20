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
    $game = irm "$apipath/new" @DefParams -Method POST -Body $(@{name="Test Game $(Get-Random)"} |ConvertTo-Json)
    $game

    # test users
    $names = 1..3 | % { "Test User $_" }
    $names | % {
        $JsonParams = @{'name' = $_; 'code' = $game.pubkey } | ConvertTo-Json
        irm @DefParams -Method POST -uri "$apipath/user" -Body $JsonParams
    }

    # ideas
    1..7 | %{
        $JsonParams = @{ idea = "Test idea $_"; code = $game.pubkey } | ConvertTo-Json
        irm @DefParams -Method POST -uri "$apipath/idea" -Body $JsonParams
    }

    # run game
    irm @DefParams -Method POST -uri "$apipath/game" -Body $(
        @{ code = $game.pubkey; secret = $game.privkey; state=1} | ConvertTo-Json
    )
}