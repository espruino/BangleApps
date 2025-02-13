<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exslt="http://exslt.org/common" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:_="http://www.topografix.com/GPX/1/1" xmlns:DEFAULT="http://www.topografix.com/GPX/1/1" version="1.0" extension-element-prefixes="exslt">
  <xsl:output omit-xml-declaration="no" indent="yes"/>

  <xsl:template match="/">
    <xsl:for-each select="//_:trkpt">
        <xsl:choose>
          <xsl:when test="_:name and _:ele">
            <xsl:text>D</xsl:text>
          </xsl:when>
          <xsl:when test="_:ele and not(_:name)">
            <xsl:text>C</xsl:text>
          </xsl:when>
          <xsl:when test="not(_:ele) and _:name">
            <xsl:text>B</xsl:text>
          </xsl:when>
          <xsl:otherwise>
            <xsl:text>A</xsl:text>
          </xsl:otherwise>
        </xsl:choose>
        <xsl:call-template name="value-of-template">
          <xsl:with-param name="select" select="format-number(@lat,&quot;+00.0000000;-00.0000000&quot;)"/>
        </xsl:call-template>
        <xsl:call-template name="value-of-template">
          <xsl:with-param name="select" select="format-number(@lon,&quot;+000.0000000;-000.0000000&quot;)"/>
        </xsl:call-template>
        <xsl:choose>
          <xsl:when test="_:ele">
            <xsl:call-template name="value-of-template">
              <xsl:with-param name="select" select="format-number(_:ele,&quot;+00000;-00000&quot;)"/>
            </xsl:call-template>
          </xsl:when>
        </xsl:choose>
        <xsl:choose>
          <xsl:when test="_:name">
            <xsl:call-template name="value-of-template">
              <xsl:with-param name="select" select="format-number(string-length(_:name),&quot;00&quot;)"/>
            </xsl:call-template>
            <xsl:call-template name="value-of-template">
              <xsl:with-param name="select" select="_:name"/>
            </xsl:call-template>
          </xsl:when>
        </xsl:choose>
        <xsl:value-of select="'&#10;'"/>
    </xsl:for-each>
  </xsl:template>
  <xsl:template name="value-of-template">
    <xsl:param name="select"/>
    <xsl:value-of select="$select"/>
    <xsl:for-each select="exslt:node-set($select)[position()&gt;1]">
      <xsl:value-of select="'&#10;'"/>
      <xsl:value-of select="."/>
    </xsl:for-each>
  </xsl:template>
</xsl:stylesheet>
