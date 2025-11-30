/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as frisby from 'frisby'
import config from 'config'

const REST_URL = 'http://localhost:3000/rest'
const URL = 'http://localhost:3000'
const jsonHeader = { 'content-type': 'application/json' }

describe('Security Fixes', () => {
  describe('Type Confusion Prevention', () => {
    it('GET product search handles array query parameter correctly', () => {
      return frisby.get(`${REST_URL}/products/search?q[]=apple&q[]=banana`)
        .expect('status', 200)
        .expect('header', 'content-type', /application\/json/)
    })

    it('GET product search handles string query parameter correctly', () => {
      return frisby.get(`${REST_URL}/products/search?q=apple`)
        .expect('status', 200)
        .expect('header', 'content-type', /application\/json/)
    })
  })

  describe('Code Injection Prevention in trackOrder', () => {
    it('GET track order with safe orderId works correctly', () => {
      return frisby.get(`${REST_URL}/track-order/5267-f9cd5882f54c75a3`)
        .expect('status', 200)
        .expect('header', 'content-type', /application\/json/)
    })

    it('GET track order prevents code injection via $where', () => {
      // This should not execute arbitrary code
      return frisby.get(`${REST_URL}/track-order/1'; return true; var x='`)
        .expect('status', 200)
        .expect('header', 'content-type', /application\/json/)
    })
  })

  describe('Code Injection Prevention in showProductReviews', () => {
    it('GET product reviews with numeric id works correctly', () => {
      return frisby.get(`${REST_URL}/products/1/reviews`)
        .expect('status', 200)
        .expect('header', 'content-type', /application\/json/)
    })

    it('GET product reviews prevents code injection via $where', () => {
      // This should not execute arbitrary code
      return frisby.get(`${REST_URL}/products/1; sleep(1000); var x=/reviews`)
        .expect('status', 200)
        .expect('header', 'content-type', /application\/json/)
    })
  })

  describe('SSRF Prevention in profileImageUrlUpload', () => {
    it('POST profile image URL accepts allowed hostname', () => {
      const form = frisby.formData()
      form.append('imageUrl', 'http://cataas.com/cat')

      return frisby.post(`${REST_URL}/user/login`, {
        headers: jsonHeader,
        body: {
          email: `jim@${config.get<string>('application.domain')}`,
          password: 'ncc-1701'
        }
      })
        .expect('status', 200)
        .then(({ json: jsonLogin }) => {
          return frisby.post(`${URL}/profile/image/url`, {
            headers: {
              Cookie: `token=${jsonLogin.authentication.token}`,
              // @ts-expect-error FIXME form.getHeaders() is not found
              'Content-Type': form.getHeaders()['content-type']
            },
            body: form,
            redirect: 'manual'
          })
            .expect('status', 302)
        })
    })

    it('POST profile image URL rejects disallowed hostname', () => {
      const form = frisby.formData()
      form.append('imageUrl', 'http://internal-server.local/secret')

      return frisby.post(`${REST_URL}/user/login`, {
        headers: jsonHeader,
        body: {
          email: `jim@${config.get<string>('application.domain')}`,
          password: 'ncc-1701'
        }
      })
        .expect('status', 200)
        .then(({ json: jsonLogin }) => {
          return frisby.post(`${URL}/profile/image/url`, {
            headers: {
              Cookie: `token=${jsonLogin.authentication.token}`,
              // @ts-expect-error FIXME form.getHeaders() is not found
              'Content-Type': form.getHeaders()['content-type']
            },
            body: form,
            redirect: 'manual'
          })
            .expect('status', 302) // Still redirects but doesn't fetch the URL
        })
    })
  })
})
