export const claimFromArbitrum = `
@CONTRACT #InboundBridge

:: IMPORT #Ledger ;;
:: IMPORT #EventLib ;;
:: IMPORT #StateLib ;;

:: FUNC #claimFromArbitrum (~STR $fromAddr, ~STR $txHash, ~NUM $amount, ~STR $token, ~STR $recipient) ::

    :: DEF $key ~STR ;;
    $key <= CONCAT("arb_", $txHash) ;;

    IF StateLib::exists($key) ::
        REVERT "Already claimed" ;;
    ENDIF ;;

    CALL #StateLib::set($key, "1") ;;
    CALL #Ledger::credit($recipient, $amount, $token) ;;

    CALL #EventLib::emit("BridgeClaimed", {
        "from_chain": "Arbitrum",
        "from_address": $fromAddr,
        "recipient": $recipient,
        "amount": $amount,
        "token": $token,
        "origin_tx": $txHash
    }) ;;

    RETURN "success" ;;

:: ENDFUNC ;;

@END


$f <= PROMPT("Enter source address (Arbitrum):") ;;
$h <= PROMPT("Enter original Arbitrum tx hash:") ;;
$a <= PROMPT("Enter amount received:") ;;
$t <= PROMPT("Enter token symbol:") ;;
$r <= PROMPT("Enter your LuminaChain address:") ;;

:: CALL #claimFromArbitrum($f, $h, $a, $t, $r) ;;

`
