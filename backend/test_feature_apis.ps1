$BaseUrl = "http://127.0.0.1:5000"

$email = Read-Host "Enter your registered email"
$password = Read-Host "Enter your password"

$meetingId = $null

try {
    # LOGIN
    $loginBody = @{
        email = $email
        password = $password
    } | ConvertTo-Json

    $login = Invoke-RestMethod `
        -Uri "$BaseUrl/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody

    $token = $login.access_token

    $headers = @{
        Authorization = "Bearer $token"
    }

    Write-Host "`nLOGIN SUCCESSFUL" -ForegroundColor Green

    # CREATE TEST MEETING
    $meetingBody = @{
        title = "Feature API Testing Meeting"
        summary = "Temporary API test"
        transcript_text = "Testing decisions, questions and tasks"
    } | ConvertTo-Json

    $meetingResponse = Invoke-RestMethod `
        -Uri "$BaseUrl/api/meetings" `
        -Method Post `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $meetingBody

    $meetingId = $meetingResponse.meeting.id

    Write-Host "TEST MEETING CREATED: $meetingId" -ForegroundColor Green

    # DECISIONS: CREATE
    $decisionBody = @{
        content = "Use React for frontend development"
    } | ConvertTo-Json

    $decisionResponse = Invoke-RestMethod `
        -Uri "$BaseUrl/api/meetings/$meetingId/decisions" `
        -Method Post `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $decisionBody

    $decisionId = $decisionResponse.decision.id

    Write-Host "DECISION CREATED: $decisionId" -ForegroundColor Green

    # DECISIONS: LIST
    $decisions = Invoke-RestMethod `
        -Uri "$BaseUrl/api/meetings/$meetingId/decisions" `
        -Method Get `
        -Headers $headers

    Write-Host "DECISIONS RETRIEVED: $($decisions.total)" -ForegroundColor Green

    # DECISIONS: UPDATE
    $updateDecision = @{
        content = "Use React and Flask for development"
    } | ConvertTo-Json

    Invoke-RestMethod `
        -Uri "$BaseUrl/api/decisions/$decisionId" `
        -Method Put `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $updateDecision | Out-Null

    Write-Host "DECISION UPDATED" -ForegroundColor Green

    # QUESTIONS: CREATE
    $questionBody = @{
        content = "Which AI model should be selected?"
    } | ConvertTo-Json

    $questionResponse = Invoke-RestMethod `
        -Uri "$BaseUrl/api/meetings/$meetingId/questions" `
        -Method Post `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $questionBody

    $questionId = $questionResponse.question.id

    Write-Host "QUESTION CREATED: $questionId" -ForegroundColor Green

    # QUESTIONS: LIST
    $questions = Invoke-RestMethod `
        -Uri "$BaseUrl/api/meetings/$meetingId/questions" `
        -Method Get `
        -Headers $headers

    Write-Host "QUESTIONS RETRIEVED: $($questions.total)" -ForegroundColor Green

    # QUESTIONS: RESOLVE
    $resolveQuestion = @{
        status = "resolved"
    } | ConvertTo-Json

    Invoke-RestMethod `
        -Uri "$BaseUrl/api/questions/$questionId" `
        -Method Put `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $resolveQuestion | Out-Null

    Write-Host "QUESTION RESOLVED" -ForegroundColor Green

    # TASKS: CREATE
    $taskBody = @{
        title = "Prepare project documentation"
        description = "Create the initial project documentation"
        assigned_to_id = $login.user.id
        priority = "high"
        status = "todo"
        due_date = "2026-11-15T17:00:00+05:30"
    } | ConvertTo-Json

    $taskResponse = Invoke-RestMethod `
        -Uri "$BaseUrl/api/meetings/$meetingId/tasks" `
        -Method Post `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $taskBody

    $taskId = $taskResponse.task.id

    Write-Host "TASK CREATED: $taskId" -ForegroundColor Green

    # TASKS: LIST
    $tasks = Invoke-RestMethod `
        -Uri "$BaseUrl/api/meetings/$meetingId/tasks" `
        -Method Get `
        -Headers $headers

    Write-Host "TASKS RETRIEVED: $($tasks.total)" -ForegroundColor Green

    # TASKS: GET SINGLE
    $singleTask = Invoke-RestMethod `
        -Uri "$BaseUrl/api/tasks/$taskId" `
        -Method Get `
        -Headers $headers

    Write-Host "SINGLE TASK RETRIEVED: $($singleTask.task.title)" -ForegroundColor Green

    # TASKS: UPDATE STATUS
    $updateTask = @{
        status = "done"
        priority = "medium"
    } | ConvertTo-Json

    $updatedTask = Invoke-RestMethod `
        -Uri "$BaseUrl/api/tasks/$taskId" `
        -Method Put `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $updateTask

    Write-Host "TASK UPDATED: $($updatedTask.task.status)" -ForegroundColor Green

    # DELETE TASK
    Invoke-RestMethod `
        -Uri "$BaseUrl/api/tasks/$taskId" `
        -Method Delete `
        -Headers $headers | Out-Null

    Write-Host "TASK DELETED" -ForegroundColor Green

    # DELETE QUESTION
    Invoke-RestMethod `
        -Uri "$BaseUrl/api/questions/$questionId" `
        -Method Delete `
        -Headers $headers | Out-Null

    Write-Host "QUESTION DELETED" -ForegroundColor Green

    # DELETE DECISION
    Invoke-RestMethod `
        -Uri "$BaseUrl/api/decisions/$decisionId" `
        -Method Delete `
        -Headers $headers | Out-Null

    Write-Host "DECISION DELETED" -ForegroundColor Green

    Write-Host "`nALL FEATURE API TESTS COMPLETED SUCCESSFULLY" -ForegroundColor Green
}
catch {
    Write-Host "`nAPI TEST FAILED" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red

    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message
    }
}
finally {
    # Remove the temporary test meeting
    if ($meetingId) {
        try {
            Invoke-RestMethod `
                -Uri "$BaseUrl/api/meetings/$meetingId" `
                -Method Delete `
                -Headers $headers | Out-Null

            Write-Host "Temporary test meeting cleaned up."
        }
        catch {
            Write-Host "Could not automatically clean up test meeting $meetingId."
        }
    }
}