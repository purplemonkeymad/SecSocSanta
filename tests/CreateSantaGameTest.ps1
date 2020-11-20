function new-santagametest {
    [CmdletBinding()]
    Param(
        $apipath = "https://localhost:5000"
    )
    $DefParams = @{
        UseBasicParsing = $true
        'ContentType' = 'application/json'
    }
    # new
    $game = irm "$apipath/new" @DefParams -Method GET

    # test users
    $names = 1..3 | % { "Test User $_" }
    $names | % {
        $JsonParams = @{'name' = $_; 'code' = $game.code } | ConvertTo-Json
        irm @DefParams -Method POST -uri "$apipath/user" -Body $JsonParams
    }

    # ideas
    1..7 | %{
        $JsonParams = @{ idea = "Test idea $_"; code = $game.code } | ConvertTo-Json
        irm @DefParams -Method POST -uri "$apipath/idea" -Body $JsonParams
    }

    # run game
    irm @DefParams -Method POST -uri "$apipath/game" -Body $(
        @{ code = $game.code; secret = $game.secret; status=1} | ConvertTo-Json
    )
}