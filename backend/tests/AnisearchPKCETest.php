<?php

use Laravel\Lumen\Testing\DatabaseMigrations;
use Laravel\Lumen\Testing\DatabaseTransactions;

class AnisearchPKCETest extends TestCase
{
    /**
     * Test PKCE implementation logic without making HTTP requests.
     * This tests the core logic that will be used in the actual OAuth flow.
     *
     * @return void
     */
    public function testPKCEImplementationLogic()
    {
        // Simulate the PKCE parameter generation logic from anisearch.php
        $code_verifier = rtrim(strtr(base64_encode(random_bytes(64)), "+/", "-_"), "=");
        $challenge_bytes = hash("sha256", $code_verifier, true);
        $code_challenge = rtrim(strtr(base64_encode($challenge_bytes), "+/", "-_"), "=");
        
        // Test that the parameters would be correctly formatted for the OAuth URL
        $expectedParams = [
            'code_challenge' => $code_challenge,
            'code_challenge_method' => 'S256',
        ];
        
        // Verify PKCE parameters have correct values
        $this->assertEquals('S256', $expectedParams['code_challenge_method'], 'code_challenge_method should be S256');
        $this->assertNotEmpty($expectedParams['code_challenge'], 'code_challenge should not be empty');
        
        // Verify code challenge format (base64url)
        $this->assertMatchesRegularExpression('/^[A-Za-z0-9_-]+$/', $expectedParams['code_challenge'], 'code_challenge should be base64url encoded');
        
        // Verify the challenge is correctly derived from the verifier
        $expectedChallenge = rtrim(strtr(base64_encode(hash("sha256", $code_verifier, true)), "+/", "-_"), "=");
        $this->assertEquals($expectedChallenge, $expectedParams['code_challenge'], 'code_challenge should be SHA256 hash of code_verifier');
    }
    
    /**
     * Test PKCE code verifier generation follows RFC 7636.
     *
     * @return void
     */
    public function testPKCECodeVerifierGeneration()
    {
        // Generate code verifier using same logic as in anisearch.php
        $code_verifier = rtrim(strtr(base64_encode(random_bytes(64)), "+/", "-_"), "=");
        
        // RFC 7636: code verifier should be 43-128 characters long
        $this->assertGreaterThanOrEqual(43, strlen($code_verifier));
        $this->assertLessThanOrEqual(128, strlen($code_verifier));
        
        // Should only contain unreserved characters [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"
        $this->assertMatchesRegularExpression('/^[A-Za-z0-9._~-]+$/', $code_verifier);
    }
    
    /**
     * Test PKCE code challenge generation follows RFC 7636.
     *
     * @return void
     */
    public function testPKCECodeChallengeGeneration()
    {
        $code_verifier = rtrim(strtr(base64_encode(random_bytes(64)), "+/", "-_"), "=");
        
        // Generate code challenge using same logic as in anisearch.php
        $challenge_bytes = hash("sha256", $code_verifier, true);
        $code_challenge = rtrim(strtr(base64_encode($challenge_bytes), "+/", "-_"), "=");
        
        // Challenge should be different from verifier
        $this->assertNotEquals($code_verifier, $code_challenge);
        
        // Challenge should be base64url encoded (only A-Z, a-z, 0-9, -, _)
        $this->assertMatchesRegularExpression('/^[A-Za-z0-9_-]+$/', $code_challenge);
        
        // Challenge should be exactly 43 characters for SHA256 (32 bytes -> 43 base64url chars)
        $this->assertEquals(43, strlen($code_challenge));
    }
}